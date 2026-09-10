import { Request, Response } from 'express';
import deletePoolCandidatesByAdminController from '../../../controllers/admin/deletePoolCandidatesByAdminController';
import candidateAdminService from '../../../services/admin/deletePoolCandidatesByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../../constants/admin/manageUserMessages';

jest.mock('../../../services/admin/deletePoolCandidatesByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeletePoolCandidateByAdmin: jest.fn(),
        softDeletePoolCandidateByAdmin: jest.fn(),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deletePoolCandidatesByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { params: { id: 'c1' }, body: { confirmDelete: true } };
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

    it('hard deletes the pool candidate when confirmDelete is true', async () => {
        const response = { success: true };
        (candidateAdminService.hardDeletePoolCandidateByAdmin as jest.Mock).mockResolvedValue(response);

        deletePoolCandidatesByAdminController.deletePoolCandidateByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(candidateAdminService.hardDeletePoolCandidateByAdmin).toHaveBeenCalledWith('c1');
        expect(candidateAdminService.softDeletePoolCandidateByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('hard delete failure responds with 500 and the soft-delete message', async () => {
        (candidateAdminService.hardDeletePoolCandidateByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deletePoolCandidatesByAdminController.deletePoolCandidateByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_SOFT_DELETE_ERROR_MESSAGE,
        });
    });

    it('soft deletes the pool candidate when confirmDelete is false', async () => {
        req = { params: { id: 'c1' }, body: { confirmDelete: false } };
        const response = { success: true };
        (candidateAdminService.softDeletePoolCandidateByAdmin as jest.Mock).mockResolvedValue(response);

        deletePoolCandidatesByAdminController.deletePoolCandidateByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(candidateAdminService.softDeletePoolCandidateByAdmin).toHaveBeenCalledWith('c1');
        expect(candidateAdminService.hardDeletePoolCandidateByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('soft delete failure responds with 500 and the hard-delete message', async () => {
        req = { params: { id: 'c1' }, body: { confirmDelete: false } };
        (candidateAdminService.softDeletePoolCandidateByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deletePoolCandidatesByAdminController.deletePoolCandidateByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_HARD_DELETE_ERROR_MESSAGE,
        });
    });
});