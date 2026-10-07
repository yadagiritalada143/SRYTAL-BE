import deleteEmployeeTaskByAdminService from '../../../services/admin/deleteEmployeeTaskByAdminService';
import EmployeePackageModel from '../../../model/employeePackageModel';

jest.mock('../../../model/employeePackageModel', () => {
    const EmployeePackageModel = jest.fn();
    (EmployeePackageModel as any).findOne = jest.fn();
    (EmployeePackageModel as any).findOneAndUpdate = jest.fn();
    return { __esModule: true, default: EmployeePackageModel };
});

const EmployeePackageModelMock = EmployeePackageModel as unknown as jest.Mock & {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
};

describe('deleteEmployeeTaskByAdminService', () => {
    beforeEach(() => {
        EmployeePackageModelMock.mockReset();
        EmployeePackageModelMock.findOne = jest.fn();
        EmployeePackageModelMock.findOneAndUpdate = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns not-found when no employee package exists', async () => {
        EmployeePackageModelMock.findOne.mockResolvedValue(null);

        const result = await deleteEmployeeTaskByAdminService.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');

        expect(EmployeePackageModelMock.findOne).toHaveBeenCalledWith({ employeeId: 'e1' });
        expect(result).toEqual({ success: false, responseAfterDelete: 'Employee package not found!' });
    });

    it('returns not-found when the package does not belong to the employee', async () => {
        const doc: any = {
            employeeId: 'e1',
            packages: [{ packageId: { toString: () => 'p-other' }, tasks: [] }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);

        const result = await deleteEmployeeTaskByAdminService.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');

        expect(result).toEqual({ success: false, responseAfterDelete: 'Package not found for employee!' });
    });

    it('returns not-found when the task does not exist in the package', async () => {
        const doc: any = {
            employeeId: 'e1',
            packages: [{ packageId: { toString: () => 'p1' }, tasks: [{ taskId: { toString: () => 't-other' } }] }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);

        const result = await deleteEmployeeTaskByAdminService.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');

        expect(result).toEqual({ success: false, responseAfterDelete: 'Task not found in the package!' });
    });

    it('removes the task and updates the package via findOneAndUpdate', async () => {
        const updateResult = { _id: 'ep1' };
        const doc: any = {
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

        const result = await deleteEmployeeTaskByAdminService.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');

        expect(doc.packages[0].tasks.map((t: any) => t.taskId.toString())).toEqual(['t2']);
        expect(EmployeePackageModelMock.findOneAndUpdate).toHaveBeenCalledWith(
            { employeeId: 'e1', 'packages.packageId': 'p1' },
            { $set: { 'packages.$.tasks': doc.packages[0].tasks } },
            { new: true }
        );
        expect(result).toEqual({ success: true, responseAfterDelete: updateResult });
    });

    it('returns { success: false } and logs when the lookup fails', async () => {
        EmployeePackageModelMock.findOne.mockRejectedValue(new Error('db failed'));

        const result = await deleteEmployeeTaskByAdminService.deleteEmployeeTaskServiceByAdmin('e1', 'p1', 't1');

        expect(console.error).toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });
});