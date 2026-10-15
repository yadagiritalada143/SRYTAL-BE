import addPackageToEmployeeByAdminService from '../../../services/admin/addPackageToEmployeeByAdminService';
import EmployeePackageModel from '../../../model/employeePackageModel';

jest.mock('../../../model/employeePackageModel', () => {
    const EmployeePackageModel = jest.fn();
    return { __esModule: true, default: EmployeePackageModel };
});

const EmployeePackageModelMock = EmployeePackageModel as unknown as jest.Mock & {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
};

describe('addPackagetoEmployeeByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        EmployeePackageModelMock.mockReset();
        EmployeePackageModelMock.findOne = jest.fn();
        EmployeePackageModelMock.findOneAndUpdate = jest.fn();
        saveSpy = jest.fn();
        EmployeePackageModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates a new employee package with a generated timesheet when none exists', async () => {
        const data = {
            employeeId: 'e1',
            packageId: 'p1',
            packages: [{ packageId: 'p1', tasks: [{ taskId: 't1' }] }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'ep1' };
        saveSpy.mockResolvedValue(saved);

        const result = await addPackageToEmployeeByAdminService.addPackagetoEmployeeByAdmin(data);

        expect(EmployeePackageModelMock.findOne).toHaveBeenCalledWith({ employeeId: 'e1', packageId: 'p1' });
        expect(EmployeePackageModelMock).toHaveBeenCalledWith(data);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(saved);

        const timesheet = (data as any).packages[0].tasks[0].timesheet as any[];
        expect(Array.isArray(timesheet)).toBe(true);
        expect(timesheet.length).toBeGreaterThanOrEqual(1);
        expect(timesheet[0]).toMatchObject({
            status: 'NOT SUBMITTED',
            hours: 0,
            comments: '',
            isHoliday: false,
            isVacation: false
        });
        expect(typeof timesheet[0].isWeekOff).toBe('boolean');
    });

    it('updates the existing employee package when one already exists', async () => {
        const data = { employeeId: 'e1', packageId: 'p1' };
        EmployeePackageModelMock.findOne.mockResolvedValue({ _id: 'ep1' });
        const updated = { _id: 'ep1', updated: true };
        EmployeePackageModelMock.findOneAndUpdate.mockResolvedValue(updated);

        const result = await addPackageToEmployeeByAdminService.addPackagetoEmployeeByAdmin(data);

        expect(EmployeePackageModelMock.findOne).toHaveBeenCalledWith({ employeeId: 'e1', packageId: 'p1' });
        expect(EmployeePackageModelMock.findOneAndUpdate).toHaveBeenCalledWith(
            { employeeId: 'e1', packageId: 'p1' },
            data,
            { new: true }
        );
        expect(EmployeePackageModelMock).not.toHaveBeenCalledWith(data);
        expect(saveSpy).not.toHaveBeenCalled();
        expect(result).toEqual(updated);
    });

    it('skips the packages mapping when data has no packages array', async () => {
        const data = { employeeId: 'e1', packageId: 'p1' };
        EmployeePackageModelMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'ep2' };
        saveSpy.mockResolvedValue(saved);

        const result = await addPackageToEmployeeByAdminService.addPackagetoEmployeeByAdmin(data);

        expect(EmployeePackageModelMock.findOne).toHaveBeenCalledWith({ employeeId: 'e1', packageId: 'p1' });
        expect(EmployeePackageModelMock).toHaveBeenCalledWith(data);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(saved);
    });

    it('skips tasks mapping when a package has no tasks array', async () => {
        const data = {
            employeeId: 'e1',
            packageId: 'p1',
            packages: [{ packageId: 'p1', tasks: 'none' }]
        };
        EmployeePackageModelMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'ep3' };
        saveSpy.mockResolvedValue(saved);
        const originalTasks = data.packages[0].tasks;

        await addPackageToEmployeeByAdminService.addPackagetoEmployeeByAdmin(data);

        expect(EmployeePackageModelMock).toHaveBeenCalledWith(data);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(data.packages[0].tasks).toBe(originalTasks);
    });

    it('propagates errors thrown by the model lookup', async () => {
        const modelError = new Error('Database lookup failed');
        EmployeePackageModelMock.findOne.mockRejectedValue(modelError);

        await expect(
            addPackageToEmployeeByAdminService.addPackagetoEmployeeByAdmin({ employeeId: 'e1', packageId: 'p1' })
        ).rejects.toThrow(modelError);
    });
});