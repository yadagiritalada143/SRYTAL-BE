"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllFeedbackAttributeByAdminService_1 = __importDefault(require("../../../services/admin/getAllFeedbackAttributeByAdminService"));
const feedbackAttributesModel_1 = __importDefault(require("../../../model/feedbackAttributesModel"));
jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = feedbackAttributesModel_1.default.find;
describe('getAllFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
    });
    it('maps the feedback attribute documents to id and name and returns them', async () => {
        const documents = [{ id: 'fa1', name: 'Communication' }, { id: 'fa2', name: 'Punctuality' }];
        findMock.mockResolvedValue(documents);
        const result = await getAllFeedbackAttributeByAdminService_1.default.getAllFeedbackAttributeByAdmin();
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            success: true,
            feedbackAttributeResponse: [
                { id: 'fa1', name: 'Communication' },
                { id: 'fa2', name: 'Punctuality' }
            ]
        });
    });
    it('returns an empty list when there are no feedback attributes', async () => {
        findMock.mockResolvedValue([]);
        const result = await getAllFeedbackAttributeByAdminService_1.default.getAllFeedbackAttributeByAdmin();
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: true, feedbackAttributeResponse: [] });
    });
});
