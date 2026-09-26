import deleteEmployeePackagesByAdminService from '../../../services/admin/deleteEmployeePackagesByAdminService';
import EmployeePackageModel from '../../../model/employeePackageModel';

jest.mock('../../../model/employeePackageModel', () => {
    const EmployeePackageModel = jest.fn();
    return { __esModule: true, default: EmployeePackageModel };
});

const EmployeePackageModelMock = EmployeePackageModel as unknown as jest.Mock & {
    findOne: jest.Mock;
    deleteOne: jest.Mock;
};

describe('deleteEmployeePackagesByAdminService', () => {
    beforeEach(() => {
        EmployeePackageModelMock.mockReset();
        EmployeePackageModelMock.findOne = jest.fn();
        EmployeePackageModelMock.deleteOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns not-found when no employee package exists', async () => {
        EmployeePackageModelMock.findOne.mockResolvedValue(null);

        const result = await deleteEmployeePackagesByAdminService.deleteEmployeePackageServiceByAdmin('e1', 'p1');

        expect(EmployeePackageModelMock.findOne).toHaveBeenCalledWith({ employeeId: 'e1' });
        expect(result).toEqual({ success: false, responseAfterDelete: 'Employee package not found !' });
        expect(EmployeePackageModelMock.deleteOne).not.toHaveBeenCalled();
    });

    it('returns not-found when the package does not belong to the employee', async () => {
        const doc: any = {
            _id: 'ep1',
            employeeId: 'e1',
            packages: [{ packageId: { toString: () => 'p-other' }, tasks: [] }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);

        const result = await deleteEmployeePackagesByAdminService.deleteEmployeePackageServiceByAdmin('e1', 'p1');

        expect(result).toEqual({ success: false, responseAfterDelete: 'Package not found for employee !' });
    });

    it('saves the document when packages remain after removal', async () => {
        const save = jest.fn().mockResolvedValue({ _id: 'ep1' });
        const doc: any = {
            _id: 'ep1',
            employeeId: 'e1',
            packages: [
                { packageId: { toString: () => 'p1' }, tasks: [] },
                { packageId: { toString: () => 'p2' }, tasks: [] }
            ],
            save
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);

        const result = await deleteEmployeePackagesByAdminService.deleteEmployeePackageServiceByAdmin('e1', 'p1');

        expect(doc.packages.map((p: any) => p.packageId.toString())).toEqual(['p2']);
        expect(save).toHaveBeenCalledTimes(1);
        expect(EmployeePackageModelMock.deleteOne).not.toHaveBeenCalled();
        expect(result).toEqual({ success: true, responseAfterDelete: { _id: 'ep1' } });
    });

    it('deletes the whole document when no packages remain', async () => {
        const save = jest.fn().mockResolvedValue({ _id: 'ep1' });
        const doc: any = {
            _id: 'ep1',
            employeeId: 'e1',
            packages: [{ packageId: { toString: () => 'p1' }, tasks: [] }],
            save
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(doc);
        EmployeePackageModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });

        const result = await deleteEmployeePackagesByAdminService.deleteEmployeePackageServiceByAdmin('e1', 'p1');

        expect(save).not.toHaveBeenCalled();
        expect(EmployeePackageModelMock.deleteOne).toHaveBeenCalledWith({ _id: 'ep1' });
        expect(result).toEqual({ success: true, responseAfterDelete: { deletedCount: 1 } });
    });

    it('returns { success: false } and logs when the lookup fails', async () => {
        EmployeePackageModelMock.findOne.mockRejectedValue(new Error('db failed'));

        const result = await deleteEmployeePackagesByAdminService.deleteEmployeePackageServiceByAdmin('e1', 'p1');

        expect(console.error).toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });
});