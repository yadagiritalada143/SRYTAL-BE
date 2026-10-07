"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getEmployeePackagesByAdminService_1 = __importDefault(require("../../../services/admin/getEmployeePackagesByAdminService"));
const employeePackageModel_1 = __importDefault(require("../../../model/employeePackageModel"));
jest.mock('../../../model/employeePackageModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = employeePackageModel_1.default.find;
describe('getEmployeePackageDetailsByAdminService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const mockQuery = (resolvedValue) => {
        const leanPopulate = jest.fn().mockResolvedValue(resolvedValue);
        findMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                populate: leanPopulate
            })
        });
        return leanPopulate;
    };
    it('returns the employee package details with timesheet data removed from tasks', async () => {
        const doc = {
            toObject: () => ({
                packages: [
                    {
                        tasks: [
                            { timesheet: 'ignored', taskId: 't1' },
                            { taskId: 't2' },
                            null
                        ]
                    }
                ]
            })
        };
        const leanPopulate = mockQuery([doc]);
        const result = await getEmployeePackagesByAdminService_1.default.getEmployeePackageDetailsByAdmin('e1');
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({ employeeId: 'e1' });
        expect(findMock.mock.results[0].value.populate).toHaveBeenCalledWith('packages.packageId');
        expect(leanPopulate).toHaveBeenCalledWith({ path: 'packages.tasks.taskId', select: '-timesheet' });
        expect(result).toEqual({
            success: true,
            employeePackageDetails: [
                {
                    packages: [{ tasks: [{ taskId: 't1' }, { taskId: 't2' }, null] }]
                }
            ]
        });
    });
    it('returns success false when the model query resolves a falsy value', async () => {
        mockQuery(null);
        const result = await getEmployeePackagesByAdminService_1.default.getEmployeePackageDetailsByAdmin('e1');
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
    it('returns success false when the model query fails', async () => {
        findMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database query failed'))
            })
        });
        const result = await getEmployeePackagesByAdminService_1.default.getEmployeePackageDetailsByAdmin('e1');
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
