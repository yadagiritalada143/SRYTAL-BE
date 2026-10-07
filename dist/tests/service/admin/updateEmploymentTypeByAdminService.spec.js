"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/updateEmploymentTypeByAdminService"));
const employmentTypeModel_1 = __importDefault(require("../../../model/employmentTypeModel"));
jest.mock('../../../model/employmentTypeModel', () => ({
    __esModule: true,
    default: { updateMany: jest.fn() }
}));
const updateManyMock = employmentTypeModel_1.default.updateMany;
describe('updateEmploymentTypeByAdminService', () => {
    beforeEach(() => {
        updateManyMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the update result when updateMany resolves', async () => {
        const updateResult = { modifiedCount: 2 };
        updateManyMock.mockResolvedValue(updateResult);
        const result = await updateEmploymentTypeByAdminService_1.default.updateEmploymentTypeByAdmin('et1', 'Contract');
        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(updateManyMock).toHaveBeenCalledWith({ _id: 'et1' }, { employmentType: 'Contract' });
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });
    it('returns success false when updateMany resolves a falsy value', async () => {
        updateManyMock.mockResolvedValue(null);
        const result = await updateEmploymentTypeByAdminService_1.default.updateEmploymentTypeByAdmin('et1', 'Permanent');
        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
    it('returns the error in the response when updateMany rejects', async () => {
        const updateError = new Error('Update failed');
        updateManyMock.mockRejectedValue(updateError);
        const result = await updateEmploymentTypeByAdminService_1.default.updateEmploymentTypeByAdmin('et1', 'Temporary');
        expect(updateManyMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});
