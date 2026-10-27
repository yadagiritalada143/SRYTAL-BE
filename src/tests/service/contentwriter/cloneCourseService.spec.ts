import mongoose from 'mongoose';
import CourseModel from '../../../model/coursesModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import cloneCourseService from '../../../services/contentwriter/cloneCourseService';
import addCourseModuleService from '../../../services/contentwriter/addCourseModuleService';
import { COURSE_CLONE_ERROR_CODES } from '../../../constants/contentwriter/courseMessages';

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: Object.assign(jest.fn(), {
        findById: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        deleteOne: jest.fn()
    })
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: Object.assign(jest.fn(), {
        find: jest.fn(),
        findOne: jest.fn(),
        distinct: jest.fn(),
        deleteMany: jest.fn()
    })
}));

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: Object.assign(jest.fn(), {
        find: jest.fn(),
        distinct: jest.fn(),
        deleteMany: jest.fn()
    })
}));

jest.mock('mongoose', () => ({
    __esModule: true,
    default: { startSession: jest.fn() }
}));

const CourseModelMock = CourseModel as unknown as jest.Mock & {
    findById: jest.Mock;
    findOne: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    deleteOne: jest.Mock;
};
const CourseModuleModelMock = CourseModuleModel as unknown as jest.Mock & {
    find: jest.Mock;
    findOne: jest.Mock;
    distinct: jest.Mock;
    deleteMany: jest.Mock;
};
const CourseTaskModelMock = CourseTaskModel as unknown as jest.Mock & {
    find: jest.Mock;
    distinct: jest.Mock;
    deleteMany: jest.Mock;
};
const startSessionMock = (mongoose as unknown as { startSession: jest.Mock }).startSession;

const makeDoc = (id: string, data: any) => ({
    ...data,
    _id: id,
    save: jest.fn().mockResolvedValue(undefined)
});

const makeSession = () => ({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    inTransaction: jest.fn().mockReturnValue(true),
    endSession: jest.fn().mockResolvedValue(undefined)
});

const sourceArchivedCourse = {
    _id: 'src-course',
    status: 'ARCHIVE',
    courseDescription: 'Source description',
    thumbnail: 'source-thumb.png'
};

const singleModuleSelection = [
    { moduleId: 'mod-1', taskIds: ['task-1'] }
];
const singleSourceModule = [
    {
        _id: 'mod-1',
        courseId: 'src-course',
        moduleName: 'Basics',
        moduleDescription: 'Module description',
        thumbnail: 'module-thumb.png',
        status: 'ACTIVE'
    }
];
const singleSourceTask = [
    {
        _id: 'task-1',
        moduleId: 'mod-1',
        taskName: 'Intro',
        taskDescription: 'Task description',
        thumbnail: 'task-thumb.png',
        status: 'ACTIVE',
        type: 'LINK',
        content: 'https://example.com',
        contentMimeType: '',
        contentFileName: '',
        starterCode: []
    }
];

describe('cloneCourseService', () => {
    let session: ReturnType<typeof makeSession>;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        session = makeSession();
        startSessionMock.mockResolvedValue(session);

        CourseModelMock.findById.mockResolvedValue(sourceArchivedCourse);
        CourseModelMock.findOne.mockResolvedValue(null);
        CourseModelMock.findByIdAndUpdate.mockResolvedValue({});
        CourseModuleModelMock.find.mockResolvedValue(singleSourceModule);
        CourseModuleModelMock.findOne.mockResolvedValue(null);
        CourseTaskModelMock.find.mockResolvedValue(singleSourceTask);
        CourseModuleModelMock.distinct.mockResolvedValue([]);
        CourseTaskModelMock.distinct.mockResolvedValue([]);
        CourseModelMock.deleteOne.mockResolvedValue({});
        CourseModuleModelMock.deleteMany.mockResolvedValue({});
        CourseTaskModelMock.deleteMany.mockResolvedValue({});

        CourseModelMock.mockImplementation((data: any) => makeDoc('new-course', data));
        CourseModuleModelMock.mockImplementation((data: any) => makeDoc('new-module', data));
        CourseTaskModelMock.mockImplementation((data: any) => makeDoc('new-task', data));
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('clones one selected module with one task into a new ACTIVE course', async () => {
        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'JavaScript Advanced',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(true);
        expect(session.commitTransaction).toHaveBeenCalledTimes(1);
        expect(session.abortTransaction).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);

        expect(result.data).toMatchObject({
            courseId: 'new-course',
            courseName: 'JavaScript Advanced',
            status: 'ACTIVE'
        });
        expect(result.data?.modules).toHaveLength(1);
        expect(result.data?.modules[0]).toMatchObject({
            moduleId: 'new-module',
            moduleName: 'Basics',
            tasks: [
                expect.objectContaining({ taskId: 'new-task', taskName: 'Intro', type: 'LINK' })
            ]
        });

        expect(CourseModelMock).toHaveBeenCalledWith(
            expect.objectContaining({ courseName: 'JavaScript Advanced', status: 'ACTIVE' })
        );
        expect(CourseModuleModelMock).toHaveBeenCalledWith(
            expect.objectContaining({ courseId: 'new-course', moduleName: 'Basics' })
        );
        expect(CourseTaskModelMock).toHaveBeenCalledWith(
            expect.objectContaining({ moduleId: 'new-module', taskName: 'Intro', type: 'LINK' })
        );
    });

    it('clones a module with multiple selected tasks preserving task fields', async () => {
        CourseTaskModelMock.find.mockResolvedValue([
            singleSourceTask[0],
            {
                _id: 'task-2',
                moduleId: 'mod-1',
                taskName: 'Second',
                taskDescription: 'Second description',
                type: 'CODE',
                status: 'ACTIVE',
                executionMode: 'CALLABLE',
                baseBoilerplate: 'function solve() {}',
                starterCode: [{ languageId: 'lang-1', code: 'print(1)' }]
            }
        ]);
        let taskCounter = 0;
        CourseTaskModelMock.mockImplementation((data: any) =>
            makeDoc(`new-task-${++taskCounter}`, data)
        );

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Clone Two',
            modules: [{ moduleId: 'mod-1', taskIds: ['task-1', 'task-2'] }]
        });

        expect(result.success).toBe(true);
        expect(result.data?.modules[0].tasks).toHaveLength(2);
        expect(result.data?.modules[0].tasks.map((task) => task.taskId)).toEqual([
            'new-task-1',
            'new-task-2'
        ]);
        expect(CourseTaskModelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'CODE',
                executionMode: 'CALLABLE',
                baseBoilerplate: 'function solve() {}',
                starterCode: [{ languageId: 'lang-1', code: 'print(1)' }]
            })
        );
    });

    it('clones multiple selected modules and only their selected tasks', async () => {
        CourseModuleModelMock.find.mockResolvedValue([
            singleSourceModule[0],
            {
                _id: 'mod-2',
                courseId: 'src-course',
                moduleName: 'Advanced',
                moduleDescription: 'Second module',
                status: 'ACTIVE'
            }
        ]);
        CourseTaskModelMock.find.mockResolvedValue([
            singleSourceTask[0],
            { _id: 'task-2', moduleId: 'mod-2', taskName: 'Deep dive', type: 'FILE', status: 'ACTIVE' }
        ]);
        let moduleCounter = 0;
        let taskCounter = 0;
        CourseModuleModelMock.mockImplementation((data: any) =>
            makeDoc(`new-module-${++moduleCounter}`, data)
        );
        CourseTaskModelMock.mockImplementation((data: any) =>
            makeDoc(`new-task-${++taskCounter}`, data)
        );

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Multi Clone',
            modules: [
                { moduleId: 'mod-1', taskIds: ['task-1'] },
                { moduleId: 'mod-2', taskIds: ['task-2'] }
            ]
        });

        expect(result.success).toBe(true);
        expect(result.data?.modules.map((module) => module.moduleId)).toEqual([
            'new-module-1',
            'new-module-2'
        ]);
        expect(result.data?.modules[1].tasks[0]).toMatchObject({
            taskId: 'new-task-2',
            taskName: 'Deep dive'
        });
    });

    it('rejects a source course that is not archived', async () => {
        CourseModelMock.findById.mockResolvedValue({ ...sourceArchivedCourse, status: 'ACTIVE' });

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Should Fail',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED);
        expect(startSessionMock).not.toHaveBeenCalled();
        expect(CourseModelMock).not.toHaveBeenCalled();
    });

    it('rejects a nonexistent source course', async () => {
        CourseModelMock.findById.mockResolvedValue(null);

        const result = await cloneCourseService.cloneCourse({
            courseId: 'missing',
            courseName: 'Should Fail',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND);
        expect(CourseModelMock).not.toHaveBeenCalled();
    });

    it('rejects a duplicate course name before starting a transaction', async () => {
        CourseModelMock.findOne.mockResolvedValue({
            _id: 'existing-course',
            courseName: 'JavaScript Advanced'
        });

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'JavaScript Advanced',
            modules: singleModuleSelection
        });

        expect(CourseModelMock.findOne).toHaveBeenCalledWith({
            courseName: 'JavaScript Advanced'
        });
        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME);
        expect(startSessionMock).not.toHaveBeenCalled();
        expect(CourseModelMock).not.toHaveBeenCalled();
    });

    it('maps a unique-validation error raised while saving to a duplicate name failure', async () => {
        const uniqueError: any = new Error('Validation failed');
        uniqueError.name = 'ValidationError';
        uniqueError.errors = {
            courseName: {
                kind: 'unique',
                message:
                    'Error, expected `courseName` to be unique. Value: `JavaScript Advanced`'
            }
        };

        CourseModelMock.mockImplementationOnce((data: any) => ({
            ...makeDoc('new-course', data),
            save: jest.fn().mockRejectedValue(uniqueError)
        }));

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'JavaScript Advanced',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME);
        expect(session.abortTransaction).toHaveBeenCalledTimes(1);
        expect(session.commitTransaction).not.toHaveBeenCalled();
    });

    it('maps a raw duplicate-key error raised while saving to a duplicate name failure', async () => {
        const duplicateKeyError: any = new Error(
            'E11000 duplicate key error collection: courses.courses index: courseName_1'
        );
        duplicateKeyError.code = 11000;
        duplicateKeyError.keyPattern = { courseName: 1 };
        duplicateKeyError.keyValue = { courseName: 'JavaScript Advanced' };

        CourseModelMock.mockImplementationOnce((data: any) => ({
            ...makeDoc('new-course', data),
            save: jest.fn().mockRejectedValue(duplicateKeyError)
        }));

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'JavaScript Advanced',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.DUPLICATE_NAME);
        expect(session.abortTransaction).toHaveBeenCalledTimes(1);
        expect(session.commitTransaction).not.toHaveBeenCalled();
    });

    it('rejects a module that does not belong to the source course', async () => {
        CourseModuleModelMock.find.mockResolvedValue([]);

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Should Fail',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.INVALID_MODULE);
        expect(CourseModelMock).not.toHaveBeenCalled();
    });

    it('rejects a task that does not belong to the selected module', async () => {
        CourseTaskModelMock.find.mockResolvedValue([
            { ...singleSourceTask[0], moduleId: 'other-module' }
        ]);

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Should Fail',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.INVALID_TASK);
        expect(CourseModelMock).not.toHaveBeenCalled();
    });

    it('aborts the transaction and returns a failure when a write fails', async () => {
        let call = 0;
        CourseTaskModelMock.mockImplementation((data: any) => {
            call += 1;
            return call === 1
                ? { ...data, _id: 'new-task', save: jest.fn().mockRejectedValue(new Error('boom')) }
                : makeDoc('new-task', data);
        });

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Rollback',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.CLONE_FAILED);
        expect(session.abortTransaction).toHaveBeenCalledTimes(1);
        expect(session.commitTransaction).not.toHaveBeenCalled();
    });

    it('falls back to a manual rollback when transactions are unsupported', async () => {
        session.startTransaction.mockImplementation(() => {
            throw new Error(
                'Transaction numbers are only allowed on a replica set member or mongos'
            );
        });

        let call = 0;
        CourseTaskModelMock.mockImplementation((data: any) => {
            call += 1;
            return call === 1
                ? { ...data, _id: 'new-task', save: jest.fn().mockRejectedValue(new Error('boom')) }
                : makeDoc('new-task', data);
        });

        const result = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Fallback',
            modules: singleModuleSelection
        });

        expect(result.success).toBe(false);
        expect(result.code).toBe(COURSE_CLONE_ERROR_CODES.CLONE_FAILED);
        expect(CourseModuleModelMock.deleteMany).toHaveBeenCalledTimes(1);
        expect(CourseModelMock.deleteOne).toHaveBeenCalledTimes(1);
    });

    it('keeps the original archived course untouched', async () => {
        await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Untouched Source',
            modules: singleModuleSelection
        });

        expect(CourseModelMock.deleteOne).not.toHaveBeenCalled();
        expect(CourseModuleModelMock.deleteMany).not.toHaveBeenCalled();
        expect(CourseTaskModelMock.deleteMany).not.toHaveBeenCalled();
    });

    it('supports adding a new module to the cloned course afterwards', async () => {
        const cloneResult = await cloneCourseService.cloneCourse({
            courseId: 'src-course',
            courseName: 'Extendable Clone',
            modules: singleModuleSelection
        });

        expect(cloneResult.success).toBe(true);
        const clonedCourseId = cloneResult.data!.courseId;

        await addCourseModuleService.addNewCourseModule(
            clonedCourseId,
            'Follow-up Module',
            'Added after cloning',
            '',
            'ACTIVE',
            1
        );

        expect(CourseModuleModelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                courseId: clonedCourseId,
                moduleName: 'Follow-up Module',
                status: 'ACTIVE'
            })
        );
        expect(CourseModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
            clonedCourseId,
            { $currentDate: { updatedAt: true } }
        );
    });
});
