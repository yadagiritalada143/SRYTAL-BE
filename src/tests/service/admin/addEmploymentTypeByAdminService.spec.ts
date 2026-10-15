import addEmploymentTypeByAdminService from '../../../services/admin/addEmploymentTypeByAdminService';
import Employmenttype from '../../../model/employmentTypeModel';

jest.mock('../../../model/employmentTypeModel', () => {
    const Employmenttype = jest.fn();
    return { __esModule: true, default: Employmenttype };
});

const EmploymenttypeMock = Employmenttype as unknown as jest.Mock;

describe('addEmploymentTypeByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        EmploymenttypeMock.mockReset();
        saveSpy = jest.fn();
        EmploymenttypeMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates an employment type document and saves it successfully', async () => {
        const savedEmploymentType = { _id: 'et123', employmentType: 'Full-Time' };
        saveSpy.mockResolvedValue(savedEmploymentType);

        const result = await addEmploymentTypeByAdminService.addEmploymentTypeByAdmin('Full-Time');

        expect(EmploymenttypeMock).toHaveBeenCalledTimes(1);
        expect(EmploymenttypeMock).toHaveBeenCalledWith({ employmentType: 'Full-Time' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedEmploymentType);
    });

    it('returns success false when the save fails instead of throwing', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));

        const result = await addEmploymentTypeByAdminService.addEmploymentTypeByAdmin('Full-Time');

        expect(EmploymenttypeMock).toHaveBeenCalledTimes(1);
        expect(EmploymenttypeMock).toHaveBeenCalledWith({ employmentType: 'Full-Time' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});