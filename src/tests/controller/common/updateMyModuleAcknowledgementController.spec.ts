import { Request, Response } from 'express';
import updateMyModuleAcknowledgementController from '../../../controllers/common/updateMyModuleAcknowledgementController';
import updateMyModuleAcknowledgementService from '../../../services/common/updateMyModuleAcknowledgementService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    MY_COURSES_ERROR_MESSAGES,
    MY_COURSES_SUCCESS_MESSAGES
} from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/updateMyModuleAcknowledgementService', () => ({
    __esModule: true,
    default: { updateMyModuleAcknowledgement: jest.fn() }
}));

const updateMyModuleAcknowledgementMock =
    updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement as unknown as jest.Mock;

describe('updateMyModuleAcknowledgementController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateMyModuleAcknowledgementMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            body: {
                courseAssignmentId: 'a1',
                moduleId: 'm1',
                acknowledged: true,
                ...overrides.body
            },
            user: { userId: 'emp1' }
        } as unknown as Request);

    it('returns 404 when the assignment is not found for the employee', async () => {
        updateMyModuleAcknowledgementMock.mockResolvedValue({ success: false, notFound: true });
        const req = buildReq();

        await updateMyModuleAcknowledgementController.updateMyModuleAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 when the module does not belong to the assigned course', async () => {
        updateMyModuleAcknowledgementMock.mockResolvedValue({ success: false, invalidModule: true });
        const req = buildReq();

        await updateMyModuleAcknowledgementController.updateMyModuleAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MODULE_NOT_IN_COURSE_MESSAGE
        });
    });

    it('returns 400 when an acknowledgement revocation is attempted', async () => {
        updateMyModuleAcknowledgementMock.mockResolvedValue({ success: false, revocationNotAllowed: true });
        const req = buildReq({ body: { acknowledged: false } });

        await updateMyModuleAcknowledgementController.updateMyModuleAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MODULE_ACKNOWLEDGEMENT_REVOCATION_NOT_ALLOWED_MESSAGE
        });
    });

    it('uses the authenticated employee id, never a body-supplied one', async () => {
        const updateResponse = {
            success: true,
            courseAssignmentId: 'a1',
            moduleId: 'm1',
            acknowledged: true,
            acknowledgedAt: new Date('2026-10-12T07:30:00.000Z')
        };
        updateMyModuleAcknowledgementMock.mockResolvedValue(updateResponse);
        const req = buildReq({ body: { userId: 'hacker' } });

        await updateMyModuleAcknowledgementController.updateMyModuleAcknowledgement(req, res);

        expect(updateMyModuleAcknowledgementMock).toHaveBeenCalledWith('a1', 'm1', true, 'emp1');
    });

    it('returns 200 with the saved acknowledgement when the service succeeds', async () => {
        const acknowledgedAt = new Date('2026-10-12T07:30:00.000Z');
        const updateResponse = {
            success: true,
            courseAssignmentId: 'a1',
            moduleId: 'm1',
            acknowledged: true,
            acknowledgedAt
        };
        updateMyModuleAcknowledgementMock.mockResolvedValue(updateResponse);
        const req = buildReq();

        await updateMyModuleAcknowledgementController.updateMyModuleAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.MODULE_ACKNOWLEDGEMENT_UPDATE_SUCCESS_MESSAGE,
            data: {
                courseAssignmentId: 'a1',
                moduleId: 'm1',
                acknowledged: true,
                acknowledgedAt
            }
        });
    });

    it('returns 500 when the service throws', async () => {
        updateMyModuleAcknowledgementMock.mockRejectedValue(new Error('Service failure'));
        const req = buildReq();

        await updateMyModuleAcknowledgementController.updateMyModuleAcknowledgement(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MODULE_ACKNOWLEDGEMENT_UPDATE_ERROR_MESSAGE
        });
    });
});