"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllFeedbackAttributeByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllFeedbackAttributeByAdminController"));
const getAllFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/getAllFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../../constants/admin/feedbackAttributeMessages");
jest.mock('../../../services/admin/getAllFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        getAllFeedbackAttributeByAdmin: jest.fn()
    }
}));
const getAllFeedbackAttributeByAdminServiceMock = getAllFeedbackAttributeByAdminService_1.default.getAllFeedbackAttributeByAdmin;
describe('getAllFeedbackAttributeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the feedback attributes when the service resolves', async () => {
        const req = {};
        const feedbackAttributes = {
            success: true,
            feedbackAttributeResponse: [{ id: 'fa1', name: 'Communication' }]
        };
        getAllFeedbackAttributeByAdminServiceMock.mockResolvedValue(feedbackAttributes);
        await getAllFeedbackAttributeByAdminController_1.default.getAllFeedbackAttributesByAdmin(req, res);
        expect(getAllFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_SUCCESS_MESSAGE,
            data: feedbackAttributes
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {};
        getAllFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await getAllFeedbackAttributeByAdminController_1.default.getAllFeedbackAttributesByAdmin(req, res);
        expect(getAllFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_ERROR_MESSAGE
        });
    });
});
