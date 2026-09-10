import { Request, Response } from 'express';
import updateTaskByAdminController from '../../../controllers/admin/updateTaskByAdminController';
import updateTaskByAdminService from '../../../services/admin/updateTaskByAdminService';
import { TASK_ERROR_MESSAGES } from '../../../constants/admin/taskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateTaskByAdminService', () => ({
    __esModule: true,
    default: {
        updateTaskByAdmin: jest.fn()
    }
}));

const updateTaskByAdminServiceMock = updateTaskByAdminService.updateTaskByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateTaskByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateTaskByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the update response, decorating the body with lastUpdatedBy', async () => {
        const req = { body: { id: 't1', name: 'Task A' } } as unknown as Request;
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateTaskByAdminServiceMock.mockResolvedValue(updateResponse);

        await updateTaskByAdminController.updateTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(updateTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateTaskByAdminServiceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 't1',
                name: 'Task A',
                lastUpdatedBy: expect.any(Date)
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 't1', name: 'Task A' } } as unknown as Request;
        updateTaskByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await updateTaskByAdminController.updateTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(updateTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: TASK_ERROR_MESSAGES.TASK_UPDATING_ERROR_MESSAGE
        });
    });
});