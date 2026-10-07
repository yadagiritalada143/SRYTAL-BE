import { Request, Response } from 'express';
import getEmployeeDetailsByAdminController from '../../../controllers/admin/getEmployeeDetailsByAdminController';
import adminService from '../../../services/admin/getUserDetailsByAdminService';
import { COMMON_ERRORS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getUserDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        getEmployeeDetailsByAdmin: jest.fn(),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getEmployeeDetailsByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { params: { id: 'u1' } };
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

    it('responds with 200 and the fetched user details on success', async () => {
        const response = { success: true, userDetails: { id: 'u1' } };
        (adminService.getEmployeeDetailsByAdmin as jest.Mock).mockResolvedValue(response);

        getEmployeeDetailsByAdminController.getUserDetails(req as Request, res as Response);
        await flushMicrotasks();

        expect(adminService.getEmployeeDetailsByAdmin).toHaveBeenCalledWith('u1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('responds with 500 and USER_FETCHING_ERROR when the service rejects', async () => {
        (adminService.getEmployeeDetailsByAdmin as jest.Mock).mockRejectedValue({ success: false });

        getEmployeeDetailsByAdminController.getUserDetails(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: COMMON_ERRORS.USER_FETCHING_ERROR });
    });
});