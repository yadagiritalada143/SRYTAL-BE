import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';
import courseTaskBoilerplateService from '../../../services/common/courseTaskBoilerplateService';
import addCourseTaskService from '../../../services/contentwriter/addCourseTaskService';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

jest.mock('../../../services/common/courseTaskBoilerplateService', () => ({
    __esModule: true,
    default: {
        generateBaseBoilerplate: jest.fn(),
        getOrGenerateCourseTaskBoilerplate: jest.fn()
    }
}));

const courseTaskModelMock = CourseTaskModel as unknown as jest.Mock;
const moduleFindByIdMock = CourseModuleModel.findById as jest.Mock;
const courseUpdateMock = CourseModel.findByIdAndUpdate as jest.Mock;
const generateBaseBoilerplateMock =
    courseTaskBoilerplateService.generateBaseBoilerplate as jest.Mock;

describe('addCourseTaskService coding boilerplate', () => {
    const saveMock = jest.fn();
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        courseTaskModelMock.mockImplementation(() => ({ save: saveMock }));
        saveMock.mockResolvedValue({
            _id: 'task-id',
            type: 'CODE',
            baseBoilerplate: 'function solve(value) { /* TODO */ }'
        });
        generateBaseBoilerplateMock.mockResolvedValue(
            'function solve(value) { /* TODO */ }'
        );
        moduleFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ courseId: 'course-id' })
        });
        courseUpdateMock.mockResolvedValue({});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('generates and saves the base function before completing task creation', async () => {
        const result = await addCourseTaskService.addCourseTask(
            'module-id',
            'Echo',
            'Return the supplied value.',
            '',
            'ACTIVE',
            'CODE',
            '',
            '',
            '',
            'writer-id'
        );

        expect(generateBaseBoilerplateMock).toHaveBeenCalledWith(
            'Return the supplied value.',
            'writer-id'
        );
        expect(courseTaskModelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                moduleId: 'module-id',
                taskDescription: 'Return the supplied value.',
                type: 'CODE',
                executionMode: 'CALLABLE',
                baseBoilerplate: 'function solve(value) { /* TODO */ }'
            })
        );
        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ type: 'CODE', baseBoilerplate: expect.any(String) });
    });

    it('does not persist a coding task if base boilerplate generation fails', async () => {
        generateBaseBoilerplateMock.mockRejectedValue(new Error('OPENROUTER_FAILED'));

        await expect(
            addCourseTaskService.addCourseTask(
                'module-id',
                'Echo',
                'Return the supplied value.',
                '',
                'ACTIVE',
                'CODE',
                '',
                '',
                '',
                'writer-id'
            )
        ).rejects.toThrow('COURSE_TASK_BOILERPLATE_GENERATION_FAILED');

        expect(courseTaskModelMock).not.toHaveBeenCalled();
        expect(saveMock).not.toHaveBeenCalled();
    });
});
