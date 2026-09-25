"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/getFeedbackAttributeByAdminService"));
const feedbackAttributesModel_1 = __importDefault(require("../../../model/feedbackAttributesModel"));
jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
const findOneMock = feedbackAttributesModel_1.default.findOne;
describe('getFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the feedback attribute details when the attribute exists', async () => {
        const feedbackAttribute = { _id: 'attr123', name: 'Communication' };
        findOneMock.mockResolvedValue(feedbackAttribute);
        const result = await getFeedbackAttributeByAdminService_1.default.getFeedbackAttributeByAdmin('attr123');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'attr123' });
        expect(result).toEqual(feedbackAttribute);
    });
    it('returns null when the feedback attribute does not exist', async () => {
        findOneMock.mockResolvedValue(null);
        const result = await getFeedbackAttributeByAdminService_1.default.getFeedbackAttributeByAdmin('unknown');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'unknown' });
        expect(result).toBeNull();
    });
    it('throws an error when the model query fails', async () => {
        findOneMock.mockRejectedValue(new Error('Database query failed'));
        await expect(getFeedbackAttributeByAdminService_1.default.getFeedbackAttributeByAdmin('attr123')).rejects.toThrow('Error in fetching feedback attribute details');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'attr123' });
    });
});
