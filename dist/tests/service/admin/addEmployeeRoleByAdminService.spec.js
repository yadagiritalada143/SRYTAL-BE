"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addEmployeeRoleByAdminService_1 = __importDefault(require("../../../services/admin/addEmployeeRoleByAdminService"));
const employeeRole_1 = __importDefault(require("../../../model/employeeRole"));
jest.mock('../../../model/employeeRole', () => {
    const Employeerole = jest.fn();
    return { __esModule: true, default: Employeerole };
});
const EmployeeroleMock = employeeRole_1.default;
describe('addEmployeeRoleByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        EmployeeroleMock.mockReset();
        saveSpy = jest.fn();
        EmployeeroleMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates an employee role document and saves it successfully', async () => {
        const savedRole = { _id: 'role123', designation: 'Software Engineer' };
        saveSpy.mockResolvedValue(savedRole);
        const result = await addEmployeeRoleByAdminService_1.default.addEmployeeRoleByAdmin('Software Engineer');
        expect(EmployeeroleMock).toHaveBeenCalledTimes(1);
        expect(EmployeeroleMock).toHaveBeenCalledWith({ designation: 'Software Engineer' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedRole);
    });
    it('returns success false when the save fails instead of throwing', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));
        const result = await addEmployeeRoleByAdminService_1.default.addEmployeeRoleByAdmin('Software Engineer');
        expect(EmployeeroleMock).toHaveBeenCalledTimes(1);
        expect(EmployeeroleMock).toHaveBeenCalledWith({ designation: 'Software Engineer' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
