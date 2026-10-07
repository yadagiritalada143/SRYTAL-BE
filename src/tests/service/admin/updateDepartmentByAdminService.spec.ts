import updateDepartmentByAdminService from '../../../services/admin/updateDepartmentByAdminService';
import DepartmentModel from '../../../model/departmentModel';

jest.mock('../../../model/departmentModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (DepartmentModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updateDepartmentByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the update result when the department is updated', async () => {
        const updateResult = { modifiedCount: 1 };
        updateOneMock.mockResolvedValue(updateResult);

        const result = await updateDepartmentByAdminService.updateDepartmentByAdmin('dept123', 'Engineering');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'dept123' }, { departmentName: 'Engineering' });
        expect(result).toEqual({ success: true, departmentResponse: updateResult });
    });

    it('returns success false with a null response when the model call returns a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);

        const result = await updateDepartmentByAdminService.updateDepartmentByAdmin('dept123', 'Engineering');

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, departmentResponse: null });
    });

    it('throws an error when the model update fails', async () => {
        updateOneMock.mockRejectedValue(new Error('Database update failed'));

        await expect(updateDepartmentByAdminService.updateDepartmentByAdmin('dept123', 'Engineering')).rejects.toThrow(
            'An error occurred while updating the department.'
        );
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'dept123' }, { departmentName: 'Engineering' });
    });
});