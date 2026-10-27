import { Request, Response } from 'express';
import addTaskByAdminController from '../../../controllers/admin/addTaskByAdminController';
import addTaskByAdminService from '../../../services/admin/addTaskByAdminService';
import { TASK_ERROR_MESSAGES } from '../../../constants/admin/taskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/addTaskByAdminService', () => ({
    __esModule: true,
    default: {
        addTaskByAdmin: jest.fn()
    }
}));

const addTaskByAdminServiceMock = addTaskByAdminService.addTaskByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addTaskByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addTaskByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the add response, decorating the body with dates and metadata', async () => {
        const req = {
            body: { name: 'Task A' },
            user: { userId: 'u1' }
        } as unknown as Request;
        const addResponse = { _id: 't1' };
        addTaskByAdminServiceMock.mockResolvedValue(addResponse);

        await addTaskByAdminController.addTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(addTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addTaskByAdminServiceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Task A',
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date),
                createdBy: 'u1',
                isDeleted: false
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(addResponse);
    });

    it('leaves createdBy undefined when req.user has no userId', async () => {
        const req = {
            body: { name: 'Task B' },
            user: {}
        } as unknown as Request;
        addTaskByAdminServiceMock.mockResolvedValue({ _id: 't2' });

        await addTaskByAdminController.addTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(addTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addTaskByAdminServiceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Task B',
                createdBy: undefined,
                isDeleted: false
            })
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { name: 'Task C' } } as unknown as Request;
        addTaskByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addTaskByAdminController.addTaskByAdmin(req, res);
        await flushMicrotasks();

        expect(addTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: TASK_ERROR_MESSAGES.TASK_ADD_ERROR_MESSAGE
        });
    });
});