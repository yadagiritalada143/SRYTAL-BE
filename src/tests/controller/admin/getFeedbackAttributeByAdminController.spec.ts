import { Request, Response } from 'express';
import getFeedbackAttributeByAdminController from '../../../controllers/admin/getFeedbackAttributeByAdminController';
import getFeedbackAttributeByAdminService from '../../../services/admin/getFeedbackAttributeByAdminService';
import {
    FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES,
    FEEDBACK_ATTRIBUTE_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/feedbackAttributeMessages';

jest.mock('../../../services/admin/getFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        getFeedbackAttributeByAdmin: jest.fn()
    }
}));

const getFeedbackAttributeByAdminServiceMock =
    getFeedbackAttributeByAdminService.getFeedbackAttributeByAdmin as unknown as jest.Mock;

describe('getFeedbackAttributeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the attribute details when the feedback attribute exists', async () => {
        const req = { params: { id: 'attr123' } } as unknown as Request;
        const feedbackAttribute = { _id: 'attr123', name: 'Communication' };
        getFeedbackAttributeByAdminServiceMock.mockResolvedValue(feedbackAttribute);

        await getFeedbackAttributeByAdminController.getFeedbackAttributeByAdmin(req, res);

        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('attr123');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_SUCCESS_MESSAGE,
            data: feedbackAttribute
        });
    });

    it('returns 404 with the not-found message when the feedback attribute does not exist', async () => {
        const req = { params: { id: 'unknown' } } as unknown as Request;
        getFeedbackAttributeByAdminServiceMock.mockResolvedValue(null);

        await getFeedbackAttributeByAdminController.getFeedbackAttributeByAdmin(req, res);

        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('unknown');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { id: 'attr123' } } as unknown as Request;
        getFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await getFeedbackAttributeByAdminController.getFeedbackAttributeByAdmin(req, res);

        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('attr123');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_ERROR_MESSAGE
        });
    });
});