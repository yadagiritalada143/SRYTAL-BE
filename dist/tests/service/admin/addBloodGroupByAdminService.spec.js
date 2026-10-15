"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addBloodGroupByAdminService_1 = __importDefault(require("../../../services/admin/addBloodGroupByAdminService"));
const bloodGroupModel_1 = __importDefault(require("../../../model/bloodGroupModel"));
jest.mock('../../../model/bloodGroupModel', () => {
    const BloodgroupModel = jest.fn();
    return { __esModule: true, default: BloodgroupModel };
});
const BloodgroupModelMock = bloodGroupModel_1.default;
describe('addBloodgroupByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        BloodgroupModelMock.mockReset();
        saveSpy = jest.fn();
        BloodgroupModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates a blood group document and saves it successfully', async () => {
        const savedBloodGroup = { _id: 'bg123', type: 'O+' };
        saveSpy.mockResolvedValue(savedBloodGroup);
        const result = await addBloodGroupByAdminService_1.default.addBloodgroupByAdmin('O+');
        expect(BloodgroupModelMock).toHaveBeenCalledTimes(1);
        expect(BloodgroupModelMock).toHaveBeenCalledWith({ type: 'O+' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedBloodGroup);
    });
    it('returns success false when the save fails instead of throwing', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));
        const result = await addBloodGroupByAdminService_1.default.addBloodgroupByAdmin('O+');
        expect(BloodgroupModelMock).toHaveBeenCalledTimes(1);
        expect(BloodgroupModelMock).toHaveBeenCalledWith({ type: 'O+' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
