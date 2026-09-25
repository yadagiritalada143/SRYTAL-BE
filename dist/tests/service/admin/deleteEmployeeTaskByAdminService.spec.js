"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeTaskByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeeTaskByAdminService"));
const employeePackageModel_1 = __importDefault(require("../../../model/employeePackageModel"));
jest.mock('../../../model/employeePackageModel', () => {
    const EmployeePackageModel = jest.fn();
    EmployeePackageModel.findOne = jest.fn();
    EmployeePackageModel.findOneAndUpdate = jest.fn();
    return { __esModule: true, default: EmployeePackageModel };
});
const EmployeePackageModelMock = employeePackageModel_1.default;
describe('deleteEmployeeTaskByAdminService', () => {
    beforeEach(() => {
        EmployeePackageModelMock.mockReset();
        EmployeePackageModelMock.findOne = jest.fn();
        EmployeePackageModelMock.findOneAndUpdate = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns not-found when no employee package exists', async () => {
        EmployeePackageModelMock.findOne.mockResolvedValue(null);
        const result = await deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');
        expect(EmployeePackageModelMock.findOne).toHaveBeenCalledWith({ employeeId: 'e1' });
        expect(result).toEqual({ success: false, responseAfterDelete: 'Employee package not found!' });
    });
    it('returns not-found when the package does not belong to the employee', async () => {
        const doc = {
            employeeId: 'e1',
            packages: [{ packageId: { toString: () => 'p-other' }, tasks: [] }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);
        const result = await deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');
        expect(result).toEqual({ success: false, responseAfterDelete: 'Package not found for employee!' });
    });
    it('returns not-found when the task does not exist in the package', async () => {
        const doc = {
            employeeId: 'e1',
            packages: [{ packageId: { toString: () => 'p1' }, tasks: [{ taskId: { toString: () => 't-other' } }] }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);
        const result = await deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');
        expect(result).toEqual({ success: false, responseAfterDelete: 'Task not found in the package!' });
    });
    it('removes the task and updates the package via findOneAndUpdate', async () => {
        const updateResult = { _id: 'ep1' };
        const doc = {
            employeeId: 'e1',
            packages: [
                {
                    packageId: { toString: () => 'p1' },
                    tasks: [
                        { taskId: { toString: () => 't1' }, startDate: new Date() },
                        { taskId: { toString: () => 't2' }, startDate: new Date() }
                    ]
                }
            ]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);
        EmployeePackageModelMock.findOneAndUpdate.mockResolvedValue(updateResult);
        const result = await deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');
        expect(doc.packages[0].tasks.map((t) => t.taskId.toString())).toEqual(['t2']);
        expect(EmployeePackageModelMock.findOneAndUpdate).toHaveBeenCalledWith({ employeeId: 'e1', 'packages.packageId': 'p1' }, { $set: { 'packages.$.tasks': doc.packages[0].tasks } }, { new: true });
        expect(result).toEqual({ success: true, responseAfterDelete: updateResult });
    });
    it('returns { success: false } and logs when the lookup fails', async () => {
        EmployeePackageModelMock.findOne.mockRejectedValue(new Error('db failed'));
        const result = await deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');
        expect(console.error).toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });
});
