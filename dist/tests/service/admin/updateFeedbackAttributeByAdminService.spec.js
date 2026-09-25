"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/updateFeedbackAttributeByAdminService"));
const feedbackAttributesModel_1 = __importDefault(require("../../../model/feedbackAttributesModel"));
jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = feedbackAttributesModel_1.default.updateOne;
describe('updateFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the update result when updateOne resolves', async () => {
        const updateResult = { modifiedCount: 1 };
        updateOneMock.mockResolvedValue(updateResult);
        const result = await updateFeedbackAttributeByAdminService_1.default.updateFeedbackAttributeByAdmin('fa1', 'Discipline');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'fa1' }, { name: 'Discipline' });
        expect(result).toEqual({ success: true, responseAfterupdate: updateResult });
    });
    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);
        const result = await updateFeedbackAttributeByAdminService_1.default.updateFeedbackAttributeByAdmin('fa1', 'Attitude');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
    it('rethrows the error when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);
        await expect(updateFeedbackAttributeByAdminService_1.default.updateFeedbackAttributeByAdmin('fa1', 'Attitude')).rejects.toThrow(updateError);
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'fa1' }, { name: 'Attitude' });
    });
});
