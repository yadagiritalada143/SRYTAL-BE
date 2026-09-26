import { Request, Response } from 'express';
import getAllFeedbackAttributeByAdminController from '../../../controllers/admin/getAllFeedbackAttributeByAdminController';
import getAllFeedbackAttributeByAdminService from '../../../services/admin/getAllFeedbackAttributeByAdminService';
import {
    FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES,
    FEEDBACK_ATTRIBUTE_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/feedbackAttributeMessages';

jest.mock('../../../services/admin/getAllFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        getAllFeedbackAttributeByAdmin: jest.fn()
    }
}));

const getAllFeedbackAttributeByAdminServiceMock =
    getAllFeedbackAttributeByAdminService.getAllFeedbackAttributeByAdmin as unknown as jest.Mock;

describe('getAllFeedbackAttributeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the feedback attributes when the service resolves', async () => {
        const req = {} as unknown as Request;
        const feedbackAttributes = {
            success: true,
            feedbackAttributeResponse: [{ id: 'fa1', name: 'Communication' }]
        };
        getAllFeedbackAttributeByAdminServiceMock.mockResolvedValue(feedbackAttributes);

        await getAllFeedbackAttributeByAdminController.getAllFeedbackAttributesByAdmin(req, res);

        expect(getAllFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_SUCCESS_MESSAGE,
            data: feedbackAttributes
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {} as unknown as Request;
        getAllFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await getAllFeedbackAttributeByAdminController.getAllFeedbackAttributesByAdmin(req, res);

        expect(getAllFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_ERROR_MESSAGE
        });
    });
});