"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteFeedbackAttributeByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteFeedbackAttributeByAdminController"));
const deleteFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/deleteFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../../constants/admin/feedbackAttributeMessages");
jest.mock('../../../services/admin/deleteFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        deleteFeedbackAttributeByAdmin: jest.fn()
    }
}));
const deleteFeedbackAttributeByAdminServiceMock = deleteFeedbackAttributeByAdminService_1.default.deleteFeedbackAttributeByAdmin;
describe('deleteFeedbackAttributeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        deleteFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the delete success message when the delete succeeds', async () => {
        const req = { params: { id: 'fa1' } };
        const deleteResult = { success: true, responseAfterDelete: { _id: 'fa1' } };
        deleteFeedbackAttributeByAdminServiceMock.mockResolvedValue(deleteResult);
        await deleteFeedbackAttributeByAdminController_1.default.deleteFeedbackAttributeByAdmin(req, res);
        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('fa1');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_SUCCESS_MESSAGE,
            data: deleteResult
        });
    });
    it('returns 404 when the attribute is not found', async () => {
        const req = { params: { id: 'fa9' } };
        deleteFeedbackAttributeByAdminServiceMock.mockResolvedValue({ success: false });
        await deleteFeedbackAttributeByAdminController_1.default.deleteFeedbackAttributeByAdmin(req, res);
        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { id: 'fa1' } };
        deleteFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await deleteFeedbackAttributeByAdminController_1.default.deleteFeedbackAttributeByAdmin(req, res);
        expect(deleteFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_ERROR_MESSAGE
        });
    });
});
