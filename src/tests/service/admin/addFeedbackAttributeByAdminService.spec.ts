import addFeedbackAttributeByAdminService from '../../../services/admin/addFeedbackAttributeByAdminService';
import FeedbackAttributesModel from '../../../model/feedbackAttributesModel';

jest.mock('../../../model/feedbackAttributesModel', () => {
    const FeedbackAttributesModel = jest.fn();
    return { __esModule: true, default: FeedbackAttributesModel };
});

const FeedbackAttributesModelMock = FeedbackAttributesModel as unknown as jest.Mock;

describe('addFeedbackAttributeByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        FeedbackAttributesModelMock.mockReset();
        saveSpy = jest.fn();
        FeedbackAttributesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates a feedback attribute document and saves it successfully', async () => {
        const savedAttribute = { _id: 'attr123', name: 'Communication' };
        saveSpy.mockResolvedValue(savedAttribute);

        const result = await addFeedbackAttributeByAdminService.addFeedbackAttributeByAdmin('Communication');

        expect(FeedbackAttributesModelMock).toHaveBeenCalledTimes(1);
        expect(FeedbackAttributesModelMock).toHaveBeenCalledWith({ name: 'Communication' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedAttribute);
    });

    it('throws an error when the save fails', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));

        await expect(addFeedbackAttributeByAdminService.addFeedbackAttributeByAdmin('Communication')).rejects.toThrow(
            'An error occurred while adding feedback attribute.'
        );
        expect(FeedbackAttributesModelMock).toHaveBeenCalledTimes(1);
        expect(FeedbackAttributesModelMock).toHaveBeenCalledWith({ name: 'Communication' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});