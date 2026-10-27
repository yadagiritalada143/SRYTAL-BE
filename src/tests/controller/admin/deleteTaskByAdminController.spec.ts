import { Request, Response } from 'express';
import deleteTaskByAdminController from '../../../controllers/admin/deleteTaskByAdminController';
import deleteTaskByAdminService from '../../../services/admin/deleteTaskByAdminService';
import { TASK_ERROR_MESSAGES } from '../../../constants/admin/taskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/deleteTaskByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeleteTaskByAdmin: jest.fn(),
        softDeleteTaskByAdmin: jest.fn()
    }
}));

const hardDeleteTaskByAdminMock = deleteTaskByAdminService.hardDeleteTaskByAdmin as unknown as jest.Mock;
const softDeleteTaskByAdminMock = deleteTaskByAdminService.softDeleteTaskByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteTaskByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        hardDeleteTaskByAdminMock.mockReset();
        softDeleteTaskByAdminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('performs a hard delete and returns 200 when confirmDelete is true', async () => {
        const req = {
            params: { id: 't1' },
            body: { confirmDelete: true }
        } as unknown as Request;
        hardDeleteTaskByAdminMock.mockResolvedValue({ success: true });

        await deleteTaskByAdminController.deleteTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(hardDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(hardDeleteTaskByAdminMock).toHaveBeenCalledWith('t1');
        expect(softDeleteTaskByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 with the hard delete error when the hard delete fails', async () => {
        const req = {
            params: { id: 't1' },
            body: { confirmDelete: true }
        } as unknown as Request;
        hardDeleteTaskByAdminMock.mockRejectedValue({ success: false });

        await deleteTaskByAdminController.deleteTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(hardDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: TASK_ERROR_MESSAGES.TASK_HARD_DELETE_ERROR_MESSAGE
        });
    });

    it('performs a soft delete and returns 200 when confirmDelete is falsy', async () => {
        const req = {
            params: { id: 't1' },
            body: { confirmDelete: false }
        } as unknown as Request;
        softDeleteTaskByAdminMock.mockResolvedValue({ success: true });

        await deleteTaskByAdminController.deleteTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(softDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(softDeleteTaskByAdminMock).toHaveBeenCalledWith('t1');
        expect(hardDeleteTaskByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 with the soft delete error when the soft delete fails', async () => {
        const req = {
            params: { id: 't1' },
            body: {}
        } as unknown as Request;
        softDeleteTaskByAdminMock.mockRejectedValue({ success: false });

        await deleteTaskByAdminController.deleteTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(softDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: TASK_ERROR_MESSAGES.TASK_SOFT_DELETE_ERROR_MESSAGE
        });
    });
});