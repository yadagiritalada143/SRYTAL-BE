"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/getAllDepartmentByAdminService"));
const departmentModel_1 = __importDefault(require("../../../model/departmentModel"));
jest.mock('../../../model/departmentModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = departmentModel_1.default.find;
describe('getAllDepartmentsByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the departments when the query resolves', async () => {
        const departments = [{ _id: 'd1', department: 'Engineering' }, { _id: 'd2', department: 'HR' }];
        findMock.mockResolvedValue(departments);
        const result = await getAllDepartmentByAdminService_1.default.getAllDepartmentsByAdmin();
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
        expect(result).toEqual({ success: true, departments });
    });
    it('throws success false when the query resolves a falsy value', async () => {
        findMock.mockResolvedValue(null);
        await expect(getAllDepartmentByAdminService_1.default.getAllDepartmentsByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
    });
    it('throws success false when the query fails', async () => {
        findMock.mockRejectedValue(new Error('Database failure'));
        await expect(getAllDepartmentByAdminService_1.default.getAllDepartmentsByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
    });
});
