import { Request, Response } from 'express';
import deletePoolCompanyByAdminController from '../../../controllers/admin/deletePoolCompanyByAdminController';
import poolCompanyByAdminService from '../../../services/admin/deletePoolCompanyByAdminService';
import { DELETE_POOL_COMPANY_ERROR_MESSAGE } from '../../../constants/admin/manageUserMessages';

jest.mock('../../../services/admin/deletePoolCompanyByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeletePoolCompanyByAdmin: jest.fn(),
        softDeletePoolCompanyByAdmin: jest.fn(),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deletePoolCompanyByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { params: { id: 'co1' }, body: { confirmDelete: true } };
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

    it('hard deletes the pool company when confirmDelete is true', async () => {
        const response = { success: true };
        (poolCompanyByAdminService.hardDeletePoolCompanyByAdmin as jest.Mock).mockResolvedValue(response);

        deletePoolCompanyByAdminController.deletePoolCompanyByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(poolCompanyByAdminService.hardDeletePoolCompanyByAdmin).toHaveBeenCalledWith('co1');
        expect(poolCompanyByAdminService.softDeletePoolCompanyByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('hard delete failure responds with 500 and the soft-delete message', async () => {
        (poolCompanyByAdminService.hardDeletePoolCompanyByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deletePoolCompanyByAdminController.deletePoolCompanyByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_SOFT_DELETE_ERROR_MESSAGE,
        });
    });

    it('soft deletes the pool company when confirmDelete is false', async () => {
        req = { params: { id: 'co1' }, body: { confirmDelete: false } };
        const response = { success: true };
        (poolCompanyByAdminService.softDeletePoolCompanyByAdmin as jest.Mock).mockResolvedValue(response);

        deletePoolCompanyByAdminController.deletePoolCompanyByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(poolCompanyByAdminService.softDeletePoolCompanyByAdmin).toHaveBeenCalledWith('co1');
        expect(poolCompanyByAdminService.hardDeletePoolCompanyByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('soft delete failure responds with 500 and the hard-delete message', async () => {
        req = { params: { id: 'co1' }, body: { confirmDelete: false } };
        (poolCompanyByAdminService.softDeletePoolCompanyByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deletePoolCompanyByAdminController.deletePoolCompanyByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_HARD_DELETE_ERROR_MESSAGE,
        });
    });
});