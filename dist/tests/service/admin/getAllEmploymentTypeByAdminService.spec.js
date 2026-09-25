"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/getAllEmploymentTypeByAdminService"));
const employmentTypeModel_1 = __importDefault(require("../../../model/employmentTypeModel"));
jest.mock('../../../model/employmentTypeModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = employmentTypeModel_1.default.find;
describe('getAllEmploymentTypesByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('resolves with the employment types list when employment types are found', async () => {
        const employmentTypes = [{ _id: 'et1', employmentType: 'Full-Time' }, { _id: 'et2', employmentType: 'Part-Time' }];
        findMock.mockResolvedValue(employmentTypes);
        await expect(getAllEmploymentTypeByAdminService_1.default.getAllEmploymentTypesByAdmin()).resolves.toEqual({
            success: true,
            employmentTypesList: employmentTypes
        });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
    it('rejects with success false when the model resolves a falsy value', async () => {
        findMock.mockResolvedValue(null);
        await expect(getAllEmploymentTypeByAdminService_1.default.getAllEmploymentTypesByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
    it('rejects with success false when the model query fails', async () => {
        findMock.mockRejectedValue(new Error('Database query failed'));
        await expect(getAllEmploymentTypeByAdminService_1.default.getAllEmploymentTypesByAdmin()).rejects.toEqual({ success: false });
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
    });
});
