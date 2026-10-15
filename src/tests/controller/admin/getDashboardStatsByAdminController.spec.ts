import { Request, Response } from 'express';
import getDashboardStatsByAdminController from '../../../controllers/admin/getDashboardStatsByAdminController';
import getDashboardStatsByAdminService from '../../../services/admin/getDashboardStatsByAdminService';
import { COMMON_ERRORS, HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getDashboardStatsByAdminService', () => ({
    __esModule: true,
    default: {
        getDashboardStatsByAdmin: jest.fn(),
    },
}));

describe('getDashboardStatsByAdminController', () => {
    let req: Partial<Request> & { user?: any };
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { user: { organizationId: 'org1', userId: 'adminId' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('responds with 200 and the dashboard stats on success', async () => {
        const result = { success: true, stats: { totalEmployees: 3 } };
        (getDashboardStatsByAdminService.getDashboardStatsByAdmin as jest.Mock).mockResolvedValue(result);

        await getDashboardStatsByAdminController.getDashboardStats(req as Request, res as Response);

        expect(getDashboardStatsByAdminService.getDashboardStatsByAdmin).toHaveBeenCalledWith('org1', 'adminId');
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(result);
    });

    it('passes undefined org/user when req.user is missing', async () => {
        req.user = undefined;
        (getDashboardStatsByAdminService.getDashboardStatsByAdmin as jest.Mock).mockResolvedValue({ success: true });

        await getDashboardStatsByAdminController.getDashboardStats(req as Request, res as Response);

        expect(getDashboardStatsByAdminService.getDashboardStatsByAdmin).toHaveBeenCalledWith(undefined, undefined);
    });

    it('responds with 500 and USER_FETCHING_ERROR when the service rejects', async () => {
        (getDashboardStatsByAdminService.getDashboardStatsByAdmin as jest.Mock).mockRejectedValue({ success: false });

        await getDashboardStatsByAdminController.getDashboardStats(req as Request, res as Response);

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: COMMON_ERRORS.USER_FETCHING_ERROR });
    });
});