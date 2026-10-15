"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFeedbackAttributeByAdminController_1 = __importDefault(require("../../../controllers/admin/getFeedbackAttributeByAdminController"));
const getFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/getFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../../constants/admin/feedbackAttributeMessages");
jest.mock('../../../services/admin/getFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        getFeedbackAttributeByAdmin: jest.fn()
    }
}));
const getFeedbackAttributeByAdminServiceMock = getFeedbackAttributeByAdminService_1.default.getFeedbackAttributeByAdmin;
describe('getFeedbackAttributeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the attribute details when the feedback attribute exists', async () => {
        const req = { params: { id: 'attr123' } };
        const feedbackAttribute = { _id: 'attr123', name: 'Communication' };
        getFeedbackAttributeByAdminServiceMock.mockResolvedValue(feedbackAttribute);
        await getFeedbackAttributeByAdminController_1.default.getFeedbackAttributeByAdmin(req, res);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('attr123');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_SUCCESS_MESSAGE,
            data: feedbackAttribute
        });
    });
    it('returns 404 with the not-found message when the feedback attribute does not exist', async () => {
        const req = { params: { id: 'unknown' } };
        getFeedbackAttributeByAdminServiceMock.mockResolvedValue(null);
        await getFeedbackAttributeByAdminController_1.default.getFeedbackAttributeByAdmin(req, res);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('unknown');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { id: 'attr123' } };
        getFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await getFeedbackAttributeByAdminController_1.default.getFeedbackAttributeByAdmin(req, res);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('attr123');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_ERROR_MESSAGE
        });
    });
});
