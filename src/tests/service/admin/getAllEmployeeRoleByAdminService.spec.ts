import getAllEmployeeRoleByAdminService from '../../../services/admin/getAllEmployeeRoleByAdminService';
import Employeerole from '../../../model/employeeRole';

jest.mock('../../../model/employeeRole', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (Employeerole as unknown as { find: jest.Mock }).find;

describe('getAllEmployeeRolesByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves with the employee roles list when employee roles are found', async () => {
        const employeeRoles = [{ _id: 'role1', designation: 'Software Engineer' }, { _id: 'role2', designation: 'Manager' }];
        findMock.mockResolvedValue(employeeRoles);

        await expect(getAllEmployeeRoleByAdminService.getAllEmployeeRolesByAdmin()).resolves.toEqual({
            success: true,
            employeeRoles: employeeRoles
        });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });

    it('rejects with success false when the model resolves a falsy value', async () => {
        findMock.mockResolvedValue(null);

        await expect(getAllEmployeeRoleByAdminService.getAllEmployeeRolesByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });

    it('rejects with success false when the model query fails', async () => {
        findMock.mockRejectedValue(new Error('Database query failed'));

        await expect(getAllEmployeeRoleByAdminService.getAllEmployeeRolesByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
});