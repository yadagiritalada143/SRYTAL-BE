"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/getDepartmentByAdminService"));
const departmentModel_1 = __importDefault(require("../../../model/departmentModel"));
jest.mock('../../../model/departmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
const findOneMock = departmentModel_1.default.findOne;
describe('getDepartmentByAdminService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the department details when the department exists', async () => {
        const department = { _id: 'dept123', departmentName: 'Engineering' };
        findOneMock.mockResolvedValue(department);
        const result = await getDepartmentByAdminService_1.default.getDepartmentByAdmin('dept123');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'dept123' });
        expect(result).toEqual(department);
    });
    it('returns null when the department does not exist', async () => {
        findOneMock.mockResolvedValue(null);
        const result = await getDepartmentByAdminService_1.default.getDepartmentByAdmin('unknown');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'unknown' });
        expect(result).toBeNull();
    });
    it('throws an error when the model query fails', async () => {
        findOneMock.mockRejectedValue(new Error('Database query failed'));
        await expect(getDepartmentByAdminService_1.default.getDepartmentByAdmin('dept123')).rejects.toThrow('Error in fetching department details');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'dept123' });
    });
});
