import { Request, Response } from 'express';
import addFeedbackAttributeByAdminController from '../../../controllers/admin/addFeedbackAttributeByAdminController';
import addFeedbackAttributeByAdminService from '../../../services/admin/addFeedbackAttributeByAdminService';
import {
    FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES,
    FEEDBACK_ATTRIBUTE_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/feedbackAttributeMessages';

jest.mock('../../../services/admin/addFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        addFeedbackAttributeByAdmin: jest.fn()
    }
}));

const addFeedbackAttributeByAdminServiceMock =
    addFeedbackAttributeByAdminService.addFeedbackAttributeByAdmin as unknown as jest.Mock;

describe('addFeedbackAttributeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds a feedback attribute successfully and returns 200 with the success message', async () => {
        const req = { body: { name: 'Communication' } } as unknown as Request;
        addFeedbackAttributeByAdminServiceMock.mockResolvedValue(undefined);

        await addFeedbackAttributeByAdminController.addFeedbackAttributeByAdmin(req, res);

        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('Communication');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_SUCCESS_MESSAGE
        });
    });

    it('passes undefined through when the body does not contain a name', async () => {
        const req = { body: {} } as unknown as Request;
        addFeedbackAttributeByAdminServiceMock.mockResolvedValue(undefined);

        await addFeedbackAttributeByAdminController.addFeedbackAttributeByAdmin(req, res);

        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { name: 'Communication' } } as unknown as Request;
        addFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addFeedbackAttributeByAdminController.addFeedbackAttributeByAdmin(req, res);

        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('Communication');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_ERROR_MESSAGE
        });
    });
});