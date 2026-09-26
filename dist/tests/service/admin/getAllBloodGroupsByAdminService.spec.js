"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllBloodGroupsByAdminService_1 = __importDefault(require("../../../services/admin/getAllBloodGroupsByAdminService"));
const bloodGroupModel_1 = __importDefault(require("../../../model/bloodGroupModel"));
jest.mock('../../../model/bloodGroupModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = bloodGroupModel_1.default.find;
describe('getAllBloodgroupsByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('resolves with the blood group list when blood groups are found', async () => {
        const bloodGroups = [{ _id: 'bg1', type: 'O+' }, { _id: 'bg2', type: 'A+' }];
        findMock.mockResolvedValue(bloodGroups);
        await expect(getAllBloodGroupsByAdminService_1.default.getAllBloodgroupsByAdmin()).resolves.toEqual({
            success: true,
            bloodGroupList: bloodGroups
        });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
    it('rejects with success false when the model resolves a falsy value', async () => {
        findMock.mockResolvedValue(null);
        await expect(getAllBloodGroupsByAdminService_1.default.getAllBloodgroupsByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
    it('rejects with success false when the model query fails', async () => {
        findMock.mockRejectedValue(new Error('Database query failed'));
        await expect(getAllBloodGroupsByAdminService_1.default.getAllBloodgroupsByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
});
