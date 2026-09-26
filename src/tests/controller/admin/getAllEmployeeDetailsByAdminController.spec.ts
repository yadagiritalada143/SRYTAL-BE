import { Request, Response } from 'express';
import getAllEmployeeDetailsByAdminController from '../../../controllers/admin/getAllEmployeeDetailsByAdminController';
import allEmployeeDetailsServices from '../../../services/admin/getAllEmployeeDetailsByAdminService';
import { COMMON_ERRORS, HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getAllEmployeeDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        getAllEmployeeDetailsByAdmin: jest.fn(),
    },
}));

describe('getAllEmployeeDetailsByAdminController', () => {
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

    it('responds with 200 and the employee details on success', async () => {
        const response = { success: true, usersList: [] };
        (allEmployeeDetailsServices.getAllEmployeeDetailsByAdmin as jest.Mock).mockResolvedValue(response);

        await getAllEmployeeDetailsByAdminController.getAllEmployeeDetails(req as Request, res as Response);

        expect(allEmployeeDetailsServices.getAllEmployeeDetailsByAdmin).toHaveBeenCalledWith('org1', 'adminId');
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('passes undefined org/user when req.user is missing', async () => {
        req.user = undefined;
        (allEmployeeDetailsServices.getAllEmployeeDetailsByAdmin as jest.Mock).mockResolvedValue({ success: true });

        await getAllEmployeeDetailsByAdminController.getAllEmployeeDetails(req as Request, res as Response);

        expect(allEmployeeDetailsServices.getAllEmployeeDetailsByAdmin).toHaveBeenCalledWith(undefined, undefined);
    });

    it('responds with 500 and USER_FETCHING_ERROR when the service rejects', async () => {
        (allEmployeeDetailsServices.getAllEmployeeDetailsByAdmin as jest.Mock).mockRejectedValue({ success: false });

        await getAllEmployeeDetailsByAdminController.getAllEmployeeDetails(req as Request, res as Response);

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: COMMON_ERRORS.USER_FETCHING_ERROR });
    });
});