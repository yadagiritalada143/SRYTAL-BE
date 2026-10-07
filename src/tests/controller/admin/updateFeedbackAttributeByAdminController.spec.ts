import { Request, Response } from 'express';
import updateFeedbackAttributeByAdminController from '../../../controllers/admin/updateFeedbackAttributeByAdminController';
import updateFeedbackAttributeByAdminService from '../../../services/admin/updateFeedbackAttributeByAdminService';
import {
    FEEDBACK_ATTRIBUTE_ERROR_MESSAGES,
    FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/feedbackAttributeMessages';

jest.mock('../../../services/admin/updateFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        updateFeedbackAttributeByAdmin: jest.fn()
    }
}));

const updateFeedbackAttributeByAdminServiceMock =
    updateFeedbackAttributeByAdminService.updateFeedbackAttributeByAdmin as unknown as jest.Mock;

describe('updateFeedbackAttributeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the update success message when the service resolves', async () => {
        const req = { body: { id: 'fa1', name: 'Discipline' } } as unknown as Request;
        updateFeedbackAttributeByAdminServiceMock.mockResolvedValue({ success: true });

        await updateFeedbackAttributeByAdminController.updateFeedbackAttributeByAdmin(req, res);

        expect(updateFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('fa1', 'Discipline');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_SUCCESS_MESSAGE
        });
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'fa1', name: 'Discipline' } } as unknown as Request;
        updateFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await updateFeedbackAttributeByAdminController.updateFeedbackAttributeByAdmin(req, res);

        expect(updateFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_ERROR_MESSAGE
        });
    });
});