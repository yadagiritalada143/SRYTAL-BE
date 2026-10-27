import { Request, Response } from 'express';
import reorderCourseTasksController from '../../../controllers/contentwriter/reorderCourseTasksController';
import reorderCourseTasksService from '../../../services/contentwriter/reorderCourseTasksService';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../../constants/contentwriter/coursetaskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/reorderCourseTasksService', () => ({
    __esModule: true,
    default: { reorderCourseTasks: jest.fn() }
}));

const reorderCourseTasksMock = reorderCourseTasksService.reorderCourseTasks as unknown as jest.Mock;

describe('reorderCourseTasksController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        reorderCourseTasksMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (body: any = {}) =>
        ({
            body: {
                moduleId: 'm1',
                tasks: [{ taskId: 't1', orderIdx: 1 }],
                ...body
            }
        } as unknown as Request);

    it('returns 200 with the reordered tasks', async () => {
        const data = { moduleId: 'm1', tasks: [{ taskId: 't1', orderIdx: 1 }] };
        reorderCourseTasksMock.mockResolvedValue({ success: true, data });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(reorderCourseTasksMock).toHaveBeenCalledWith('m1', [{ taskId: 't1', orderIdx: 1 }]);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_REORDER_SUCCESS_MESSAGE,
            data
        });
    });

    it('returns 400 for an invalid module ID', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'INVALID_MODULE_ID' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_MODULE_ID_MESSAGE
        });
    });

    it('returns 404 when the module is not found', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'MODULE_NOT_FOUND' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MODULE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when a task belongs to another module', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'TASK_NOT_IN_MODULE' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_IN_MODULE_MESSAGE
        });
    });

    it('returns 404 when a task is not found', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'TASK_NOT_FOUND' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 for duplicate orderIdx values', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'DUPLICATE_ORDER_IDX' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE
        });
    });

    it('returns 400 for duplicate task IDs', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'DUPLICATE_TASK_ID' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_TASK_ID_MESSAGE
        });
    });

    it('returns 400 for invalid orderIdx values', async () => {
        reorderCourseTasksMock.mockResolvedValue({ success: false, errorCode: 'INVALID_ORDER_IDX' });

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        reorderCourseTasksMock.mockRejectedValue(new Error('Service failure'));

        await reorderCourseTasksController.reorderCourseTasks(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_REORDER_ERROR_MESSAGE
        });
    });
});
