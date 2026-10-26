import reorderCourseTasksService from '../../../services/contentwriter/reorderCourseTasksService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { find: jest.fn(), findOne: jest.fn(), bulkWrite: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

const findMock = (CourseTaskModel as unknown as { find: jest.Mock }).find;
const findOneMock = (CourseTaskModel as unknown as { findOne: jest.Mock }).findOne;
const bulkWriteMock = (CourseTaskModel as unknown as { bulkWrite: jest.Mock }).bulkWrite;
const findModuleByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const findCourseByIdAndUpdateMock = (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

const moduleId = '507f1f77bcf86cd799439011';
const otherModuleId = '507f1f77bcf86cd799439012';
const courseId = '507f1f77bcf86cd799439013';
const taskId1 = '507f1f77bcf86cd799439014';
const taskId2 = '507f1f77bcf86cd799439015';
const taskId3 = '507f1f77bcf86cd799439016';

const buildSelectResult = (value: any) => ({
    select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(value)
    })
});

describe('reorderCourseTasksService', () => {
    beforeEach(() => {
        findMock.mockReset();
        findOneMock.mockReset();
        bulkWriteMock.mockReset();
        findModuleByIdMock.mockReset();
        findCourseByIdAndUpdateMock.mockReset();

        findModuleByIdMock.mockImplementation(() => buildSelectResult({ _id: moduleId, courseId }));
        findOneMock.mockImplementation(() => buildSelectResult(null));
        bulkWriteMock.mockResolvedValue({});
        findCourseByIdAndUpdateMock.mockResolvedValue({});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates task order and returns the tasks in the payload order', async () => {
        const tasks = [
            { taskId: taskId1, orderIdx: 2 },
            { taskId: taskId2, orderIdx: 1 }
        ];
        findMock
            .mockImplementationOnce(() => buildSelectResult([
                { _id: taskId1, moduleId },
                { _id: taskId2, moduleId }
            ]))
            .mockImplementationOnce(() => buildSelectResult([
                { _id: taskId1, orderIdx: 2 },
                { _id: taskId2, orderIdx: 1 }
            ]));

        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, tasks);

        expect(bulkWriteMock).toHaveBeenCalledWith([
            {
                updateOne: {
                    filter: { _id: taskId1, moduleId },
                    update: { $set: { orderIdx: 2 } }
                }
            },
            {
                updateOne: {
                    filter: { _id: taskId2, moduleId },
                    update: { $set: { orderIdx: 1 } }
                }
            }
        ]);
        expect(findCourseByIdAndUpdateMock).toHaveBeenCalledWith(courseId, {
            $currentDate: { updatedAt: true }
        });
        expect(result).toEqual({
            success: true,
            data: {
                moduleId,
                tasks: [
                    { taskId: taskId1, orderIdx: 2 },
                    { taskId: taskId2, orderIdx: 1 }
                ]
            }
        });
    });

    it('rejects duplicate orderIdx values in the payload', async () => {
        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 1 },
            { taskId: taskId2, orderIdx: 1 }
        ]);

        expect(bulkWriteMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'DUPLICATE_ORDER_IDX' });
    });

    it('rejects duplicate task IDs in the payload', async () => {
        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 1 },
            { taskId: taskId1, orderIdx: 2 }
        ]);

        expect(bulkWriteMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'DUPLICATE_TASK_ID' });
    });

    it('rejects an invalid module ID', async () => {
        const result = await reorderCourseTasksService.reorderCourseTasks('invalid', [
            { taskId: taskId1, orderIdx: 1 }
        ]);

        expect(findModuleByIdMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'INVALID_MODULE_ID' });
    });

    it('rejects an invalid task ID', async () => {
        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: 'invalid', orderIdx: 1 }
        ]);

        expect(findModuleByIdMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'INVALID_TASK_ID' });
    });

    it('returns MODULE_NOT_FOUND when the module does not exist', async () => {
        findModuleByIdMock.mockImplementationOnce(() => buildSelectResult(null));

        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 1 }
        ]);

        expect(bulkWriteMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'MODULE_NOT_FOUND' });
    });

    it('returns TASK_NOT_FOUND when any task is missing', async () => {
        findMock.mockImplementationOnce(() => buildSelectResult([{ _id: taskId1, moduleId }]));

        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 1 },
            { taskId: taskId2, orderIdx: 2 }
        ]);

        expect(bulkWriteMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'TASK_NOT_FOUND' });
    });

    it('returns TASK_NOT_IN_MODULE when a task belongs to another module', async () => {
        findMock.mockImplementationOnce(() => buildSelectResult([
            { _id: taskId1, moduleId },
            { _id: taskId2, moduleId: otherModuleId }
        ]));

        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 1 },
            { taskId: taskId2, orderIdx: 2 }
        ]);

        expect(bulkWriteMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'TASK_NOT_IN_MODULE' });
    });

    it('returns DUPLICATE_ORDER_IDX when another task already holds the orderIdx', async () => {
        findMock.mockImplementationOnce(() => buildSelectResult([
            { _id: taskId1, moduleId }
        ]));
        findOneMock.mockImplementationOnce(() => buildSelectResult({ _id: taskId3 }));

        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 5 }
        ]);

        expect(bulkWriteMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, errorCode: 'DUPLICATE_ORDER_IDX' });
    });

    it('returns REORDER_FAILED when the database operation throws', async () => {
        findMock.mockImplementationOnce(() => buildSelectResult([
            { _id: taskId1, moduleId }
        ]));
        bulkWriteMock.mockRejectedValue(new Error('Database failure'));

        const result = await reorderCourseTasksService.reorderCourseTasks(moduleId, [
            { taskId: taskId1, orderIdx: 1 }
        ]);

        expect(result).toEqual({ success: false, errorCode: 'REORDER_FAILED' });
    });
});
