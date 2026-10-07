import addEmployeeRoleByAdminService from '../../../services/admin/addEmployeeRoleByAdminService';
import Employeerole from '../../../model/employeeRole';

jest.mock('../../../model/employeeRole', () => {
    const Employeerole = jest.fn();
    return { __esModule: true, default: Employeerole };
});

const EmployeeroleMock = Employeerole as unknown as jest.Mock;

describe('addEmployeeRoleByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        EmployeeroleMock.mockReset();
        saveSpy = jest.fn();
        EmployeeroleMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates an employee role document and saves it successfully', async () => {
        const savedRole = { _id: 'role123', designation: 'Software Engineer' };
        saveSpy.mockResolvedValue(savedRole);

        const result = await addEmployeeRoleByAdminService.addEmployeeRoleByAdmin('Software Engineer');

        expect(EmployeeroleMock).toHaveBeenCalledTimes(1);
        expect(EmployeeroleMock).toHaveBeenCalledWith({ designation: 'Software Engineer' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedRole);
    });

    it('returns success false when the save fails instead of throwing', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));

        const result = await addEmployeeRoleByAdminService.addEmployeeRoleByAdmin('Software Engineer');

        expect(EmployeeroleMock).toHaveBeenCalledTimes(1);
        expect(EmployeeroleMock).toHaveBeenCalledWith({ designation: 'Software Engineer' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});