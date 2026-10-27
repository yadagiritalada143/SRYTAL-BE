import { Request, Response } from 'express';
import updateEmployeeDetailsByAdminController from '../../../controllers/admin/updateEmployeeDetailsByAdminController';
import adminService from '../../../services/admin/updateEmployeeDetailsByAdminService';
import { COMMON_ERRORS, HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateEmployeeDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        updateEmployeeProfileByAdmin: jest.fn(),
    },
}));

describe('updateEmployeeDetailsByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { body: { email: 'a@x.com', firstName: 'John' } };
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

    it('responds with 200 and the update response on success', async () => {
        const response = { success: true };
        (adminService.updateEmployeeProfileByAdmin as jest.Mock).mockResolvedValue(response);

        await updateEmployeeDetailsByAdminController.updateProfile(req as Request, res as Response);

        expect(adminService.updateEmployeeProfileByAdmin).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('responds with 500 and USER_UPDATING_ERROR when the service throws', async () => {
        (adminService.updateEmployeeProfileByAdmin as jest.Mock).mockRejectedValue(new Error('update failed'));

        await updateEmployeeDetailsByAdminController.updateProfile(req as Request, res as Response);

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: COMMON_ERRORS.USER_UPDATING_ERROR });
    });
});