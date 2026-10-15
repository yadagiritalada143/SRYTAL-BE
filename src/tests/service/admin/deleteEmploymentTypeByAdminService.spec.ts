import deleteEmploymentTypeByAdminService from '../../../services/admin/deleteEmploymentTypeByAdminService';
import Employmenttype from '../../../model/employmentTypeModel';

jest.mock('../../../model/employmentTypeModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));

const findByIdAndDeleteMock = (Employmenttype as unknown as { findByIdAndDelete: jest.Mock }).findByIdAndDelete;

describe('deleteEmploymentTypeByAdminService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the deleted employment type when a document is deleted', async () => {
        const deletedType = { _id: 'et1', employmentType: 'Permanent' };
        findByIdAndDeleteMock.mockResolvedValue(deletedType);

        const result = await deleteEmploymentTypeByAdminService.deleteEmploymentTypeByAdmin('et1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith({ _id: 'et1' });
        expect(result).toEqual({ success: true, responseAfterDelete: deletedType });
    });

    it('returns success false when no document matches the id', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);

        const result = await deleteEmploymentTypeByAdminService.deleteEmploymentTypeByAdmin('et4');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns the error in the response when deletion fails', async () => {
        const deleteError = new Error('Delete failed');
        findByIdAndDeleteMock.mockRejectedValue(deleteError);

        const result = await deleteEmploymentTypeByAdminService.deleteEmploymentTypeByAdmin('et1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterDelete: deleteError });
    });
});