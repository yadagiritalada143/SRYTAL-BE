import deleteDepartmentByAdminService from '../../../services/admin/deleteDepartmentByAdminService';
import Department from '../../../model/departmentModel';

jest.mock('../../../model/departmentModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));

const findByIdAndDeleteMock = (Department as unknown as { findByIdAndDelete: jest.Mock }).findByIdAndDelete;

describe('deleteDepartmentByAdminService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success true with a null response when the department does not exist', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);

        const result = await deleteDepartmentByAdminService.deleteDepartmentByAdmin('unknown');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('unknown');
        expect(result).toEqual({ success: true, responseAfterDelete: null });
    });

    it('returns success false with the deleted department when the department exists', async () => {
        const deletedDepartment = { _id: 'dept123', departmentName: 'Engineering' };
        findByIdAndDeleteMock.mockResolvedValue(deletedDepartment);

        const result = await deleteDepartmentByAdminService.deleteDepartmentByAdmin('dept123');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('dept123');
        expect(result).toEqual({ success: false, responseAfterDelete: deletedDepartment });
    });

    it('re-throws the error when the model delete fails', async () => {
        const deleteError = new Error('Database delete failed');
        findByIdAndDeleteMock.mockRejectedValue(deleteError);

        await expect(deleteDepartmentByAdminService.deleteDepartmentByAdmin('dept123')).rejects.toThrow(deleteError);
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('dept123');
    });
});