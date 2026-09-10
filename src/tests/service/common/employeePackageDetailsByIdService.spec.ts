import employeePackageDetailsByIdService from '../../../services/common/employeePackageDetailsByIdService';
import EmployeePackageModel from '../../../model/employeePackageModel';

jest.mock('../../../model/employeePackageModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const findMock = (EmployeePackageModel as unknown as { find: jest.Mock }).find;

const mockChain = (documents: any, error?: Error) => {
    const lean = error
        ? jest.fn().mockRejectedValue(error)
        : jest.fn().mockResolvedValue(documents);
    findMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({ lean })
        })
    });
};

describe('employeePackageDetailsByIdService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the packages with timesheets filtered to the date range', async () => {
        const employeePackageDetails = [
            {
                _id: 'ep1',
                packages: [
                    {
                        _id: 'pkg1',
                        tasks: [
                            {
                                _id: 'task1',
                                title: 'Build API',
                                timesheet: [
                                    { _id: 't1', date: '2026-01-05', hours: 2 },
                                    { _id: 't2', date: '2026-01-15', hours: 3 }
                                ]
                            },
                            {
                                _id: 'task2',
                                title: 'Docs',
                                timesheet: []
                            }
                        ]
                    }
                ]
            }
        ];
        mockChain(employeePackageDetails);

        const result = await employeePackageDetailsByIdService.employeePackageDetailsById('u1', '2026-01-10', '2026-01-20');

        expect(findMock).toHaveBeenCalledWith({ employeeId: 'u1' });
        expect(result.success).toBe(true);
        expect(result.employeePackageDetails![0].packages[0].tasks[0].timesheet).toEqual([
            { _id: 't2', date: '2026-01-15', hours: 3 }
        ]);
        expect(result.employeePackageDetails![0].packages[0].tasks[1].timesheet).toEqual([]);
    });

    it('returns success false when no package details are found', async () => {
        mockChain(null);

        const result = await employeePackageDetailsByIdService.employeePackageDetailsById('u1', '2026-01-10', '2026-01-20');

        expect(result).toEqual({ success: false });
    });

    it('returns success false when the lookup throws', async () => {
        mockChain(undefined, new Error('DB down'));

        const result = await employeePackageDetailsByIdService.employeePackageDetailsById('u1', '2026-01-10', '2026-01-20');

        expect(result).toEqual({ success: false });
    });
});