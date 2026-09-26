import { Request, Response } from 'express';
import updateMyTaskProgressController from '../../../controllers/common/updateMyTaskProgressController';
import updateMyTaskProgressService from '../../../services/common/updateMyTaskProgressService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/updateMyTaskProgressService', () => ({
    __esModule: true,
    default: { updateMyTaskProgress: jest.fn() }
}));

const updateMyTaskProgressServiceMock =
    updateMyTaskProgressService.updateMyTaskProgress as unknown as jest.Mock;

describe('updateMyTaskProgressController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateMyTaskProgressServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (body: any) =>
        ({ body, user: { userId: 'emp1' } }) as unknown as Request;

    it.each([
        [{}],
        [{ courseAssignmentId: 'assign1' }],
        [{ courseAssignmentId: 'assign1', taskId: 'task1' }],
        [{ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: 'yes' }]
    ])('returns 400 when required fields are missing or invalid', async (body) => {
        await updateMyTaskProgressController.updateMyTaskProgress(buildReq(body), res);

        expect(updateMyTaskProgressServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 404 when the assignment is not found', async () => {
        updateMyTaskProgressServiceMock.mockResolvedValue({ success: false, notFound: true });

        await updateMyTaskProgressController.updateMyTaskProgress(
            buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }),
            res
        );

        expect(updateMyTaskProgressServiceMock).toHaveBeenCalledWith('assign1', 'task1', true, 'emp1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when the task is not part of the course', async () => {
        updateMyTaskProgressServiceMock.mockResolvedValue({ success: false, invalidTask: true });

        await updateMyTaskProgressController.updateMyTaskProgress(
            buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_COURSE_MESSAGE
        });
    });

    it('returns 200 with the progress response on success', async () => {
        const progressResponse = {
            success: true,
            courseStatus: 'In Progress',
            progress: { totalTasks: 1, completedTasks: 1, percentComplete: 100 },
            task: { taskId: 'task1', isCompleted: true, completedAt: new Date('2026-07-08') }
        };
        updateMyTaskProgressServiceMock.mockResolvedValue(progressResponse);

        await updateMyTaskProgressController.updateMyTaskProgress(
            buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            ...progressResponse,
            message: MY_COURSES_SUCCESS_MESSAGES.TASK_PROGRESS_UPDATE_SUCCESS_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        updateMyTaskProgressServiceMock.mockRejectedValue(new Error('boom'));

        await updateMyTaskProgressController.updateMyTaskProgress(
            buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_UPDATE_ERROR_MESSAGE
        });
    });

    it('calls the service with undefined when the request has no user', async () => {
        const req = {
            body: { courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }
        } as unknown as Request;
        updateMyTaskProgressServiceMock.mockResolvedValue({ success: true });

        await updateMyTaskProgressController.updateMyTaskProgress(req, res);

        expect(updateMyTaskProgressServiceMock).toHaveBeenCalledWith('assign1', 'task1', true, undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
});