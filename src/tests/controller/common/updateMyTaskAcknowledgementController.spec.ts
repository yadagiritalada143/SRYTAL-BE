import { Request, Response } from 'express';
import updateMyTaskAcknowledgementController from '../../../controllers/common/updateMyTaskAcknowledgementController';
import updateMyTaskAcknowledgementService from '../../../services/common/updateMyTaskAcknowledgementService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/updateMyTaskAcknowledgementService', () => ({
    __esModule: true,
    default: { updateMyTaskAcknowledgement: jest.fn() }
}));

const updateMyTaskAcknowledgementMock =
    updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement as unknown as jest.Mock;

describe('updateMyTaskAcknowledgementController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateMyTaskAcknowledgementMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            body: {
                courseAssignmentId: 'a1',
                taskId: 't1',
                acknowledged: true,
                ...overrides.body
            },
            user: { userId: 'emp1' }
        } as unknown as Request);

    it('returns 404 when the assignment is not found for the employee', async () => {
        updateMyTaskAcknowledgementMock.mockResolvedValue({ success: false, notFound: true });
        const req = buildReq();

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when the task does not belong to the assigned course', async () => {
        updateMyTaskAcknowledgementMock.mockResolvedValue({ success: false, invalidTask: true });
        const req = buildReq();

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_ASSIGNED_COURSE_MESSAGE
        });
    });

    it('returns 400 when the task is not a FILE task', async () => {
        updateMyTaskAcknowledgementMock.mockResolvedValue({ success: false, notFileTask: true });
        const req = buildReq();

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_APPLIES_TO_FILE_MESSAGE
        });
    });

    it('returns 400 when an acknowledgement revocation is attempted', async () => {
        updateMyTaskAcknowledgementMock.mockResolvedValue({ success: false, revocationNotAllowed: true });
        const req = buildReq({ body: { acknowledged: false } });

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_REVOCATION_NOT_ALLOWED_MESSAGE
        });
    });

    it('uses the authenticated employee id, never a body-supplied one', async () => {
        const updateResponse = {
            success: true,
            courseAssignmentId: 'a1',
            taskId: 't1',
            acknowledged: true,
            acknowledgedAt: new Date('2026-10-12T07:30:00.000Z')
        };
        updateMyTaskAcknowledgementMock.mockResolvedValue(updateResponse);
        const req = buildReq({ body: { userId: 'hacker' } });

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(updateMyTaskAcknowledgementMock).toHaveBeenCalledWith('a1', 't1', true, 'emp1');
    });

    it('returns 200 with the saved acknowledgement when the service succeeds', async () => {
        const acknowledgedAt = new Date('2026-10-12T07:30:00.000Z');
        const updateResponse = {
            success: true,
            courseAssignmentId: 'a1',
            taskId: 't1',
            acknowledged: true,
            acknowledgedAt
        };
        updateMyTaskAcknowledgementMock.mockResolvedValue(updateResponse);
        const req = buildReq();

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.TASK_ACKNOWLEDGEMENT_UPDATE_SUCCESS_MESSAGE,
            data: {
                courseAssignmentId: 'a1',
                taskId: 't1',
                acknowledged: true,
                acknowledgedAt
            }
        });
    });

    it('returns 500 when the service throws', async () => {
        updateMyTaskAcknowledgementMock.mockRejectedValue(new Error('Service failure'));
        const req = buildReq();

        await updateMyTaskAcknowledgementController.updateMyTaskAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_UPDATE_ERROR_MESSAGE
        });
    });
});