"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/updateDepartmentByAdminService"));
const departmentModel_1 = __importDefault(require("../../../model/departmentModel"));
jest.mock('../../../model/departmentModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = departmentModel_1.default.updateOne;
describe('updateDepartmentByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the update result when the department is updated', async () => {
        const updateResult = { modifiedCount: 1 };
        updateOneMock.mockResolvedValue(updateResult);
        const result = await updateDepartmentByAdminService_1.default.updateDepartmentByAdmin('dept123', 'Engineering');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'dept123' }, { departmentName: 'Engineering' });
        expect(result).toEqual({ success: true, departmentResponse: updateResult });
    });
    it('returns success false with a null response when the model call returns a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);
        const result = await updateDepartmentByAdminService_1.default.updateDepartmentByAdmin('dept123', 'Engineering');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, departmentResponse: null });
    });
    it('throws an error when the model update fails', async () => {
        updateOneMock.mockRejectedValue(new Error('Database update failed'));
        await expect(updateDepartmentByAdminService_1.default.updateDepartmentByAdmin('dept123', 'Engineering')).rejects.toThrow('An error occurred while updating the department.');
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'dept123' }, { departmentName: 'Engineering' });
    });
});
