"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/addEmploymentTypeByAdminService"));
const employmentTypeModel_1 = __importDefault(require("../../../model/employmentTypeModel"));
jest.mock('../../../model/employmentTypeModel', () => {
    const Employmenttype = jest.fn();
    return { __esModule: true, default: Employmenttype };
});
const EmploymenttypeMock = employmentTypeModel_1.default;
describe('addEmploymentTypeByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        EmploymenttypeMock.mockReset();
        saveSpy = jest.fn();
        EmploymenttypeMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('creates an employment type document and saves it successfully', async () => {
        const savedEmploymentType = { _id: 'et123', employmentType: 'Full-Time' };
        saveSpy.mockResolvedValue(savedEmploymentType);
        const result = await addEmploymentTypeByAdminService_1.default.addEmploymentTypeByAdmin('Full-Time');
        expect(EmploymenttypeMock).toHaveBeenCalledTimes(1);
        expect(EmploymenttypeMock).toHaveBeenCalledWith({ employmentType: 'Full-Time' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedEmploymentType);
    });
    it('returns success false when the save fails instead of throwing', async () => {
        saveSpy.mockRejectedValue(new Error('Database save failed'));
        const result = await addEmploymentTypeByAdminService_1.default.addEmploymentTypeByAdmin('Full-Time');
        expect(EmploymenttypeMock).toHaveBeenCalledTimes(1);
        expect(EmploymenttypeMock).toHaveBeenCalledWith({ employmentType: 'Full-Time' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
