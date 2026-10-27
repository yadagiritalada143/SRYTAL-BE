import { Request, Response } from 'express';
import deleteFeedbackAttributeByAdminController from '../../../controllers/admin/deleteFeedbackAttributeByAdminController';
import deleteFeedbackAttributeByAdminService from '../../../services/admin/deleteFeedbackAttributeByAdminService';
import {
    FEEDBACK_ATTRIBUTE_ERROR_MESSAGES,
    FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/feedbackAttributeMessages';

jest.mock('../../../services/admin/deleteFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        deleteFeedbackAttributeByAdmin: jest.fn()
    }
}));

const deleteFeedbackAttributeByAdminServiceMock =
    deleteFeedbackAttributeByAdminService.deleteFeedbackAttributeByAdmin as unknown as jest.Mock;

describe('deleteFeedbackAttributeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the delete success message when the delete succeeds', async () => {
        const req = { params: { id: 'fa1' } } as unknown as Request;
        const deleteResult = { success: true, responseAfterDelete: { _id: 'fa1' } };
        deleteFeedbackAttributeByAdminServiceMock.mockResolvedValue(deleteResult);

        await deleteFeedbackAttributeByAdminController.deleteFeedbackAttributeByAdmin(req, res);

        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('fa1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_SUCCESS_MESSAGE,
            data: deleteResult
        });
    });

    it('returns 404 when the attribute is not found', async () => {
        const req = { params: { id: 'fa9' } } as unknown as Request;
        deleteFeedbackAttributeByAdminServiceMock.mockResolvedValue({ success: false });

        await deleteFeedbackAttributeByAdminController.deleteFeedbackAttributeByAdmin(req, res);

        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { id: 'fa1' } } as unknown as Request;
        deleteFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await deleteFeedbackAttributeByAdminController.deleteFeedbackAttributeByAdmin(req, res);

        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_ERROR_MESSAGE
        });
    });
});