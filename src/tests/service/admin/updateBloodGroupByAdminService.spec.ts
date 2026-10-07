import updateBloodGroupByAdminService from '../../../services/admin/updateBloodGroupByAdminService';
import BloodgroupModel from '../../../model/bloodGroupModel';

jest.mock('../../../model/bloodGroupModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (BloodgroupModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updateBloodGroupByAdminService', () => {
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

        const result = await updateBloodGroupByAdminService.updateBloodGroupByAdmin('bg1', 'AB+');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'bg1' }, { type: 'AB+' });
        expect(result).toEqual({ success: true, responseAfterupdate: updateResult });
    });

    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);

        const result = await updateBloodGroupByAdminService.updateBloodGroupByAdmin('bg1', 'B+');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns the error in the response when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);

        const result = await updateBloodGroupByAdminService.updateBloodGroupByAdmin('bg1', 'O+');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterupdate: updateError });
    });
});