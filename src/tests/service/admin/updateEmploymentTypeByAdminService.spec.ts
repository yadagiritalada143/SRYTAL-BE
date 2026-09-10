import updateEmploymentTypeByAdminService from '../../../services/admin/updateEmploymentTypeByAdminService';
import Employmenttype from '../../../model/employmentTypeModel';

jest.mock('../../../model/employmentTypeModel', () => ({
    __esModule: true,
    default: { updateMany: jest.fn() }
}));

const updateManyMock = (Employmenttype as unknown as { updateMany: jest.Mock }).updateMany;

describe('updateEmploymentTypeByAdminService', () => {
    beforeEach(() => {
        updateManyMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the update result when updateMany resolves', async () => {
        const updateResult = { modifiedCount: 2 };
        updateManyMock.mockResolvedValue(updateResult);

        const result = await updateEmploymentTypeByAdminService.updateEmploymentTypeByAdmin('et1', 'Contract');

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(updateManyMock).toHaveBeenCalledWith({ _id: 'et1' }, { employmentType: 'Contract' });
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });

    it('returns success false when updateMany resolves a falsy value', async () => {
        updateManyMock.mockResolvedValue(null);

        const result = await updateEmploymentTypeByAdminService.updateEmploymentTypeByAdmin('et1', 'Permanent');

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns the error in the response when updateMany rejects', async () => {
        const updateError = new Error('Update failed');
        updateManyMock.mockRejectedValue(updateError);

        const result = await updateEmploymentTypeByAdminService.updateEmploymentTypeByAdmin('et1', 'Temporary');

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});