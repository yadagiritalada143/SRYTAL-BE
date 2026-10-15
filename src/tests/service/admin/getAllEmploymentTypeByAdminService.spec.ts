import getAllEmploymentTypeByAdminService from '../../../services/admin/getAllEmploymentTypeByAdminService';
import Employmenttype from '../../../model/employmentTypeModel';

jest.mock('../../../model/employmentTypeModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (Employmenttype as unknown as { find: jest.Mock }).find;

describe('getAllEmploymentTypesByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves with the employment types list when employment types are found', async () => {
        const employmentTypes = [{ _id: 'et1', employmentType: 'Full-Time' }, { _id: 'et2', employmentType: 'Part-Time' }];
        findMock.mockResolvedValue(employmentTypes);

        await expect(getAllEmploymentTypeByAdminService.getAllEmploymentTypesByAdmin()).resolves.toEqual({
            success: true,
            employmentTypesList: employmentTypes
        });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });

    it('rejects with success false when the model resolves a falsy value', async () => {
        findMock.mockResolvedValue(null);

        await expect(getAllEmploymentTypeByAdminService.getAllEmploymentTypesByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });

    it('rejects with success false when the model query fails', async () => {
        findMock.mockRejectedValue(new Error('Database query failed'));

        await expect(getAllEmploymentTypeByAdminService.getAllEmploymentTypesByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
});