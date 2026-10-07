import addBloodgroupByAdminService from '../../../services/admin/addBloodGroupByAdminService';
import BloodgroupModel from '../../../model/bloodGroupModel';

jest.mock('../../../model/bloodGroupModel', () => {
    const BloodgroupModel = jest.fn();
    return { __esModule: true, default: BloodgroupModel };
});

const BloodgroupModelMock = BloodgroupModel as unknown as jest.Mock;

describe('addBloodgroupByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        BloodgroupModelMock.mockReset();
        saveSpy = jest.fn();
        BloodgroupModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates a blood group document and saves it successfully', async () => {
        const savedBloodGroup = { _id: 'bg123', type: 'O+' };
        saveSpy.mockResolvedValue(savedBloodGroup);

        const result = await addBloodgroupByAdminService.addBloodgroupByAdmin('O+');

        expect(BloodgroupModelMock).toHaveBeenCalledTimes(1);
        expect(BloodgroupModelMock).toHaveBeenCalledWith({ type: 'O+' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedBloodGroup);
    });

    it('returns success false when the save fails instead of throwing', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));

        const result = await addBloodgroupByAdminService.addBloodgroupByAdmin('O+');

        expect(BloodgroupModelMock).toHaveBeenCalledTimes(1);
        expect(BloodgroupModelMock).toHaveBeenCalledWith({ type: 'O+' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});