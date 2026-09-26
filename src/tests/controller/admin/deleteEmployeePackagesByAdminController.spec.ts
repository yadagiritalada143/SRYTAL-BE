import { Request, Response } from 'express';
import deleteEmployeePackagesByAdminController from '../../../controllers/admin/deleteEmployeePackagesByAdminController';
import deleteEmployeePackageService from '../../../services/admin/deleteEmployeePackagesByAdminService';
import { EMPLOYEE_PACKAGE_ERROR_MESSAGES } from '../../../constants/admin/employeePackageMessages';

jest.mock('../../../services/admin/deleteEmployeePackagesByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmployeePackageServiceByAdmin: jest.fn(),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteEmployeePackagesByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { body: { employeeId: 'e1', packageId: 'p1' } };
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

    it('responds with 200 and the delete response on success', async () => {
        const response = { success: true, responseAfterDelete: {} };
        (deleteEmployeePackageService.deleteEmployeePackageServiceByAdmin as jest.Mock).mockResolvedValue(response);

        deleteEmployeePackagesByAdminController.deleteEmployeePackageByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(deleteEmployeePackageService.deleteEmployeePackageServiceByAdmin).toHaveBeenCalledWith('e1', 'p1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('responds with 500 and the delete error message on failure', async () => {
        (deleteEmployeePackageService.deleteEmployeePackageServiceByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deleteEmployeePackagesByAdminController.deleteEmployeePackageByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_PACKAGE_ERROR_MESSAGES.EMPLOYEE_PACKAGE_DELETE_ERROR_MESSAGE,
        });
    });
});