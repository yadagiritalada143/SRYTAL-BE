"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/addFeedbackAttributeByAdminService"));
const feedbackAttributesModel_1 = __importDefault(require("../../../model/feedbackAttributesModel"));
jest.mock('../../../model/feedbackAttributesModel', () => {
    const FeedbackAttributesModel = jest.fn();
    return { __esModule: true, default: FeedbackAttributesModel };
});
const FeedbackAttributesModelMock = feedbackAttributesModel_1.default;
describe('addFeedbackAttributeByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        FeedbackAttributesModelMock.mockReset();
        saveSpy = jest.fn();
        FeedbackAttributesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates a feedback attribute document and saves it successfully', async () => {
        const savedAttribute = { _id: 'attr123', name: 'Communication' };
        saveSpy.mockResolvedValue(savedAttribute);
        const result = await addFeedbackAttributeByAdminService_1.default.addFeedbackAttributeByAdmin('Communication');
        expect(FeedbackAttributesModelMock).toHaveBeenCalledTimes(1);
        expect(FeedbackAttributesModelMock).toHaveBeenCalledWith({ name: 'Communication' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedAttribute);
    });
    it('throws an error when the save fails', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));
        await expect(addFeedbackAttributeByAdminService_1.default.addFeedbackAttributeByAdmin('Communication')).rejects.toThrow('An error occurred while adding feedback attribute.');
        expect(FeedbackAttributesModelMock).toHaveBeenCalledTimes(1);
        expect(FeedbackAttributesModelMock).toHaveBeenCalledWith({ name: 'Communication' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});
