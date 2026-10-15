"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/addDepartmentByAdminService"));
const departmentModel_1 = __importDefault(require("../../../model/departmentModel"));
jest.mock('../../../model/departmentModel', () => {
    const Department = jest.fn();
    return { __esModule: true, default: Department };
});
const DepartmentMock = departmentModel_1.default;
describe('addDepartmentByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        DepartmentMock.mockReset();
        saveSpy = jest.fn();
        DepartmentMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates a department document with the department name and saves it successfully', async () => {
        const savedDepartment = { _id: 'dept123', departmentName: 'Engineering' };
        saveSpy.mockResolvedValue(savedDepartment);
        const result = await addDepartmentByAdminService_1.default.addDepartmentByAdmin('Engineering');
        expect(DepartmentMock).toHaveBeenCalledTimes(1);
        expect(DepartmentMock).toHaveBeenCalledWith({ departmentName: 'Engineering' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedDepartment);
    });
    it('throws an error when the department save fails', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));
        await expect(addDepartmentByAdminService_1.default.addDepartmentByAdmin('Engineering')).rejects.toThrow('An error occurred while adding department.');
        expect(DepartmentMock).toHaveBeenCalledTimes(1);
        expect(DepartmentMock).toHaveBeenCalledWith({ departmentName: 'Engineering' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});
