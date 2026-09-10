import updateFeedbackAttributeByAdminService from '../../../services/admin/updateFeedbackAttributeByAdminService';
import FeedbackAttributesModel from '../../../model/feedbackAttributesModel';

jest.mock('../../../model/feedbackAttributesModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (FeedbackAttributesModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updateFeedbackAttributeByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the update result when updateOne resolves', async () => {
        const updateResult = { modifiedCount: 1 };
        updateOneMock.mockResolvedValue(updateResult);

        const result = await updateFeedbackAttributeByAdminService.updateFeedbackAttributeByAdmin('fa1', 'Discipline');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'fa1' }, { name: 'Discipline' });
        expect(result).toEqual({ success: true, responseAfterupdate: updateResult });
    });

    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);

        const result = await updateFeedbackAttributeByAdminService.updateFeedbackAttributeByAdmin('fa1', 'Attitude');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('rethrows the error when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);

        await expect(
            updateFeedbackAttributeByAdminService.updateFeedbackAttributeByAdmin('fa1', 'Attitude')
        ).rejects.toThrow(updateError);

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'fa1' }, { name: 'Attitude' });
    });
});