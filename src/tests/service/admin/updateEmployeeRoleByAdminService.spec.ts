import updateEmployeeRoleByAdminService from '../../../services/admin/updateEmployeeRoleByAdminService';
import Employeerole from '../../../model/employeeRole';

jest.mock('../../../model/employeeRole', () => ({
    __esModule: true,
    default: { updateMany: jest.fn() }
}));

const updateManyMock = (Employeerole as unknown as { updateMany: jest.Mock }).updateMany;

describe('updateEmployeeRoleByAdminService', () => {
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

        const result = await updateEmployeeRoleByAdminService.updateEmployeeRoleByAdmin('r1', 'Manager');

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(updateManyMock).toHaveBeenCalledWith({ _id: 'r1' }, { designation: 'Manager' });
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });

    it('returns success false when updateMany resolves a falsy value', async () => {
        updateManyMock.mockResolvedValue(null);

        const result = await updateEmployeeRoleByAdminService.updateEmployeeRoleByAdmin('r1', 'Lead');

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns the error in the response when updateMany rejects', async () => {
        const updateError = new Error('Update failed');
        updateManyMock.mockRejectedValue(updateError);

        const result = await updateEmployeeRoleByAdminService.updateEmployeeRoleByAdmin('r1', 'Lead');

        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});