import deleteFeedbackAttributeByAdminService from '../../../services/admin/deleteFeedbackAttributeByAdminService';
import FeedbackAttributesModel from '../../../model/feedbackAttributesModel';

jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));

const findByIdAndDeleteMock = (FeedbackAttributesModel as unknown as { findByIdAndDelete: jest.Mock })
    .findByIdAndDelete;

describe('deleteFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the deleted attribute when a document is deleted', async () => {
        const deletedAttribute = { _id: 'fa1', name: 'Punctuality' };
        findByIdAndDeleteMock.mockResolvedValue(deletedAttribute);

        const result = await deleteFeedbackAttributeByAdminService.deleteFeedbackAttributeByAdmin('fa1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('fa1');
        expect(result).toEqual({ success: true, responseAfterDelete: deletedAttribute });
    });

    it('returns success false when no document matches the id', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);

        const result = await deleteFeedbackAttributeByAdminService.deleteFeedbackAttributeByAdmin('fa9');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns success false when deletion fails', async () => {
        findByIdAndDeleteMock.mockRejectedValue(new Error('Delete failed'));

        const result = await deleteFeedbackAttributeByAdminService.deleteFeedbackAttributeByAdmin('fa1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});