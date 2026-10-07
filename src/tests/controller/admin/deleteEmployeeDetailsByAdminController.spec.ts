import { Request, Response } from 'express';
import deleteEmployeeDetailsByAdminController from '../../../controllers/admin/deleteEmployeeDetailsByAdminController';
import adminService from '../../../services/admin/deleteEmployeeDetailsByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../../constants/admin/manageUserMessages';

jest.mock('../../../services/admin/deleteEmployeeDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeleteEmployeeProfileByAdmin: jest.fn(),
        softDeleteEmployeeProfileByAdmin: jest.fn(),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteEmployeeDetailsByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { body: { id: 'u1', confirmDelete: true } };
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

    it('hard deletes the profile when confirmDelete is true', async () => {
        const response = { success: true };
        (adminService.hardDeleteEmployeeProfileByAdmin as jest.Mock).mockResolvedValue(response);

        deleteEmployeeDetailsByAdminController.deleteProfile(req as Request, res as Response);
        await flushMicrotasks();

        expect(adminService.hardDeleteEmployeeProfileByAdmin).toHaveBeenCalledWith('u1');
        expect(adminService.softDeleteEmployeeProfileByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('hard delete failure responds with 500 and the hard delete error message', async () => {
        (adminService.hardDeleteEmployeeProfileByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deleteEmployeeDetailsByAdminController.deleteProfile(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: DELETE_ERROR_MESSAGES.DELETE_USER_HARD_DELETE_ERROR_MESSAGE,
        });
    });

    it('soft deletes the profile when confirmDelete is false', async () => {
        req = { body: { id: 'u1', confirmDelete: false } };
        const response = { success: true };
        (adminService.softDeleteEmployeeProfileByAdmin as jest.Mock).mockResolvedValue(response);

        deleteEmployeeDetailsByAdminController.deleteProfile(req as Request, res as Response);
        await flushMicrotasks();

        expect(adminService.softDeleteEmployeeProfileByAdmin).toHaveBeenCalledWith('u1');
        expect(adminService.hardDeleteEmployeeProfileByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('soft delete failure responds with 500 and the soft delete error message', async () => {
        req = { body: { id: 'u1', confirmDelete: false } };
        (adminService.softDeleteEmployeeProfileByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deleteEmployeeDetailsByAdminController.deleteProfile(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: DELETE_ERROR_MESSAGES.DELETE_USER_SOFT_DELETE_ERROR_MESSAGE,
        });
    });
});