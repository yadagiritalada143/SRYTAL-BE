"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateFeedbackAttributeByAdminController_1 = __importDefault(require("../../../controllers/admin/updateFeedbackAttributeByAdminController"));
const updateFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/updateFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../../constants/admin/feedbackAttributeMessages");
jest.mock('../../../services/admin/updateFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        updateFeedbackAttributeByAdmin: jest.fn()
    }
}));
const updateFeedbackAttributeByAdminServiceMock = updateFeedbackAttributeByAdminService_1.default.updateFeedbackAttributeByAdmin;
describe('updateFeedbackAttributeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the update success message when the service resolves', async () => {
        const req = { body: { id: 'fa1', name: 'Discipline' } };
        updateFeedbackAttributeByAdminServiceMock.mockResolvedValue({ success: true });
        await updateFeedbackAttributeByAdminController_1.default.updateFeedbackAttributeByAdmin(req, res);
        expect(updateFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('fa1', 'Discipline');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_SUCCESS_MESSAGE
        });
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'fa1', name: 'Discipline' } };
        updateFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await updateFeedbackAttributeByAdminController_1.default.updateFeedbackAttributeByAdmin(req, res);
        expect(updateFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_ERROR_MESSAGE
        });
    });
});
