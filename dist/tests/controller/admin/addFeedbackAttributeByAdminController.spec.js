"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addFeedbackAttributeByAdminController_1 = __importDefault(require("../../../controllers/admin/addFeedbackAttributeByAdminController"));
const addFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/addFeedbackAttributeByAdminService"));
const feedbackAttributeMessages_1 = require("../../../constants/admin/feedbackAttributeMessages");
jest.mock('../../../services/admin/addFeedbackAttributeByAdminService', () => ({
    __esModule: true,
    default: {
        addFeedbackAttributeByAdmin: jest.fn()
    }
}));
const addFeedbackAttributeByAdminServiceMock = addFeedbackAttributeByAdminService_1.default.addFeedbackAttributeByAdmin;
describe('addFeedbackAttributeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addFeedbackAttributeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('adds a feedback attribute successfully and returns 200 with the success message', async () => {
        const req = { body: { name: 'Communication' } };
        addFeedbackAttributeByAdminServiceMock.mockResolvedValue(undefined);
        await addFeedbackAttributeByAdminController_1.default.addFeedbackAttributeByAdmin(req, res);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('Communication');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_SUCCESS_MESSAGE
        });
    });
    it('passes undefined through when the body does not contain a name', async () => {
        const req = { body: {} };
        addFeedbackAttributeByAdminServiceMock.mockResolvedValue(undefined);
        await addFeedbackAttributeByAdminController_1.default.addFeedbackAttributeByAdmin(req, res);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { name: 'Communication' } };
        addFeedbackAttributeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await addFeedbackAttributeByAdminController_1.default.addFeedbackAttributeByAdmin(req, res);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addFeedbackAttributeByAdminServiceMock).toHaveBeenCalledWith('Communication');
        expect(mockStatus).toHaveBeenCalledWith(feedbackAttributeMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: feedbackAttributeMessages_1.FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_ERROR_MESSAGE
        });
    });
});
