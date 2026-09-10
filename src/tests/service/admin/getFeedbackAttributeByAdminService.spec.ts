import getFeedbackAttributeByAdminService from '../../../services/admin/getFeedbackAttributeByAdminService';
import FeedbackAttributesModel from '../../../model/feedbackAttributesModel';

jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

const findOneMock = (FeedbackAttributesModel as unknown as { findOne: jest.Mock }).findOne;

describe('getFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the feedback attribute details when the attribute exists', async () => {
        const feedbackAttribute = { _id: 'attr123', name: 'Communication' };
        findOneMock.mockResolvedValue(feedbackAttribute);

        const result = await getFeedbackAttributeByAdminService.getFeedbackAttributeByAdmin('attr123');

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'attr123' });
        expect(result).toEqual(feedbackAttribute);
    });

    it('returns null when the feedback attribute does not exist', async () => {
        findOneMock.mockResolvedValue(null);

        const result = await getFeedbackAttributeByAdminService.getFeedbackAttributeByAdmin('unknown');

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'unknown' });
        expect(result).toBeNull();
    });

    it('throws an error when the model query fails', async () => {
        findOneMock.mockRejectedValue(new Error('Database query failed'));

        await expect(getFeedbackAttributeByAdminService.getFeedbackAttributeByAdmin('attr123')).rejects.toThrow(
            'Error in fetching feedback attribute details'
        );
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'attr123' });
    });
});