"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getPackageDetailsByAdminService_1 = __importDefault(require("../../../services/admin/getPackageDetailsByAdminService"));
const packageModel_1 = __importDefault(require("../../../model/packageModel"));
const taskModel_1 = __importDefault(require("../../../model/taskModel"));
jest.mock('../../../model/packageModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/taskModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findByIdMock = packageModel_1.default.findById;
const findMock = taskModel_1.default.find;
describe('getPackageDetailsByAdminService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the package detail including its tasks', async () => {
        const packageDoc = {
            toObject: () => ({ _id: 'p1', name: 'Premium' })
        };
        findByIdMock.mockReturnValue({
            populate: jest.fn().mockResolvedValue(packageDoc)
        });
        const tasks = [{ _id: 't1', name: 'Task A' }];
        findMock.mockReturnValue({
            populate: jest.fn().mockResolvedValue(tasks)
        });
        const result = await getPackageDetailsByAdminService_1.default.getPackageDetailsByAdmin('p1');
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith('p1');
        expect(findByIdMock.mock.results[0].value.populate).toHaveBeenCalledWith('approvers', 'firstName lastName');
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({ packageId: 'p1', isDeleted: false });
        expect(findMock.mock.results[0].value.populate).toHaveBeenCalledWith('createdBy', 'firstName lastName');
        expect(result).toEqual({
            success: true,
            packageDetails: { _id: 'p1', name: 'Premium', tasks }
        });
    });
    it('returns success false when the package document is not found', async () => {
        findByIdMock.mockReturnValue({
            populate: jest.fn().mockResolvedValue(null)
        });
        const result = await getPackageDetailsByAdminService_1.default.getPackageDetailsByAdmin('p9');
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });
    it('returns success false when the package lookup fails', async () => {
        findByIdMock.mockReturnValue({
            populate: jest.fn().mockRejectedValue(new Error('Database failure'))
        });
        const result = await getPackageDetailsByAdminService_1.default.getPackageDetailsByAdmin('p1');
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
