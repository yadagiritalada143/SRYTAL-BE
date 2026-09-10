import { Request, Response } from 'express';
import getEmployeeDashboardController from '../../../controllers/common/getEmployeeDashboardController';
import getEmployeeDashboardService from '../../../services/common/getEmployeeDashboardService';
import { EMPLOYEE_ERRORS, HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/getEmployeeDashboardService', () => ({
    __esModule: true,
    default: { getEmployeeDashboard: jest.fn() }
}));

const getEmployeeDashboardServiceMock = getEmployeeDashboardService.getEmployeeDashboard as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getEmployeeDashboardController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getEmployeeDashboardServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the dashboard data on success', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        const dashboardResponse = { success: true, stats: {}, profile: {} };
        getEmployeeDashboardServiceMock.mockResolvedValue(dashboardResponse);

        await getEmployeeDashboardController.getEmployeeDashboard(req, res);
        await flushMicrotasks();

        expect(getEmployeeDashboardServiceMock).toHaveBeenCalledWith('u1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(dashboardResponse);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        getEmployeeDashboardServiceMock.mockRejectedValue(new Error('boom'));

        await getEmployeeDashboardController.getEmployeeDashboard(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ERRORS.EMPLOYEE_DASHBOARD_FETCHING_ERROR
        });
    });

    it('calls the service with undefined when the request has no user', async () => {
        const req = {} as unknown as Request;
        getEmployeeDashboardServiceMock.mockResolvedValue({ success: true });

        await getEmployeeDashboardController.getEmployeeDashboard(req, res);
        await flushMicrotasks();

        expect(getEmployeeDashboardServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
});