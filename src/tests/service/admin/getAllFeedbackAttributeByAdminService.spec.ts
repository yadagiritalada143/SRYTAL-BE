import getAllFeedbackAttributeByAdminService from '../../../services/admin/getAllFeedbackAttributeByAdminService';
import FeedbackAttributesModel from '../../../model/feedbackAttributesModel';

jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (FeedbackAttributesModel as unknown as { find: jest.Mock }).find;

describe('getAllFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
    });

    it('maps the feedback attribute documents to id and name and returns them', async () => {
        const documents = [{ id: 'fa1', name: 'Communication' }, { id: 'fa2', name: 'Punctuality' }];
        findMock.mockResolvedValue(documents);

        const result = await getAllFeedbackAttributeByAdminService.getAllFeedbackAttributeByAdmin();

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

        const result = await getAllFeedbackAttributeByAdminService.getAllFeedbackAttributeByAdmin();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: true, feedbackAttributeResponse: [] });
    });
});