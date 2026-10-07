import getAllDepartmentByAdminService from '../../../services/admin/getAllDepartmentByAdminService';
import Departmentmodel from '../../../model/departmentModel';

jest.mock('../../../model/departmentModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (Departmentmodel as unknown as { find: jest.Mock }).find;

describe('getAllDepartmentsByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the departments when the query resolves', async () => {
        const departments = [{ _id: 'd1', department: 'Engineering' }, { _id: 'd2', department: 'HR' }];
        findMock.mockResolvedValue(departments);

        const result = await getAllDepartmentByAdminService.getAllDepartmentsByAdmin();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
        expect(result).toEqual({ success: true, departments });
    });

    it('throws success false when the query resolves a falsy value', async () => {
        findMock.mockResolvedValue(null);

        await expect(getAllDepartmentByAdminService.getAllDepartmentsByAdmin()).rejects.toEqual({ success: false });

        expect(findMock).toHaveBeenCalledTimes(1);
    });

    it('throws success false when the query fails', async () => {
        findMock.mockRejectedValue(new Error('Database failure'));

        await expect(getAllDepartmentByAdminService.getAllDepartmentsByAdmin()).rejects.toEqual({ success: false });

        expect(findMock).toHaveBeenCalledTimes(1);
    });
});