import getAllPackagesByAdminService from '../../../services/admin/getAllPackagesByAdminService';
import PackagesModel from '../../../model/packageModel';
import TaskModel from '../../../model/taskModel';

jest.mock('../../../model/packageModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/taskModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findPackagesMock = (PackagesModel as unknown as { find: jest.Mock }).find;
const findTasksMock = (TaskModel as unknown as { find: jest.Mock }).find;

const mockPackageQuery = (resolvedValue: any) => {
    findPackagesMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(resolvedValue)
        })
    });
};

const mockTaskQuery = (resolvedValue: any) => {
    findTasksMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(resolvedValue)
        })
    });
};

describe('getAllPackagesWithTasksByAdminService', () => {
    beforeEach(() => {
        findPackagesMock.mockReset();
        findTasksMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success false with an empty list when no packages are found', async () => {
        mockPackageQuery([]);

        const result = await getAllPackagesByAdminService.getAllPackagesWithTasksByAdmin();

        expect(findPackagesMock).toHaveBeenCalledTimes(1);
        expect(findPackagesMock).toHaveBeenCalledWith({ isDeleted: false });
        expect(result).toEqual({ success: false, packagesList: [] });
        expect(findTasksMock).not.toHaveBeenCalled();
    });

    it('returns packages grouped with their tasks when packages exist', async () => {
        const packagesList = [{ _id: 'p1', name: 'Premium' }, { _id: 'p2', name: 'Basic' }, { _id: 'p3', name: 'Empty' }];
        const taskList = [
            { packageId: 'p1', title: 'Task A' },
            { packageId: 'p2', title: 'Task B' },
            { packageId: undefined, title: 'Orphan Task' }
        ];
        mockPackageQuery(packagesList);
        mockTaskQuery(taskList);

        const result = await getAllPackagesByAdminService.getAllPackagesWithTasksByAdmin();

        expect(findPackagesMock).toHaveBeenCalledTimes(1);
        expect(findPackagesMock).toHaveBeenCalledWith({ isDeleted: false });
        expect(findTasksMock).toHaveBeenCalledTimes(1);
        expect(findTasksMock).toHaveBeenCalledWith({ packageId: { $in: ['p1', 'p2', 'p3'] }, isDeleted: false });
        expect(result.success).toBe(true);
        const fetchedPackagesList = result.packagesList as unknown as any[];
        expect(fetchedPackagesList).toHaveLength(3);
        expect(fetchedPackagesList[0].tasks).toEqual([taskList[0]]);
        expect(fetchedPackagesList[1].tasks).toEqual([taskList[1]]);
        expect(fetchedPackagesList[2].tasks).toEqual([]);
    });

    it('returns success false when the model query fails', async () => {
        findPackagesMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('Database query failed'))
            })
        });

        const result = await getAllPackagesByAdminService.getAllPackagesWithTasksByAdmin();

        expect(findPackagesMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});