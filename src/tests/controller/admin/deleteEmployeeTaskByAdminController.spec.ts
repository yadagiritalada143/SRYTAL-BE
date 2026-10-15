import { Request, Response } from 'express';
import deleteEmployeeTaskByAdminController from '../../../controllers/admin/deleteEmployeeTaskByAdminController';
import deleteEmployeeTaskService from '../../../services/admin/deleteEmployeeTaskByAdminService';
import { EMPLOYEE_TASK_ERROR_MESSAGE } from '../../../constants/admin/employeePackageMessages';

jest.mock('../../../services/admin/deleteEmployeeTaskByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmployeeTaskServiceByAdmin: jest.fn(),
    },
}));

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteEmployeeTaskByAdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response> & {
        status: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        req = { body: { employeeId: 'e1', packageId: 'p1', taskId: 't1' } };
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
        (deleteEmployeeTaskService.deleteEmployeeTaskServiceByAdmin as jest.Mock).mockResolvedValue(response);

        deleteEmployeeTaskByAdminController.deleteEmployeeTaskByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(deleteEmployeeTaskService.deleteEmployeeTaskServiceByAdmin).toHaveBeenCalledWith('e1', 'p1', 't1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });

    it('responds with 500 and the task delete error message on failure', async () => {
        (deleteEmployeeTaskService.deleteEmployeeTaskServiceByAdmin as jest.Mock).mockRejectedValue({ success: false });

        deleteEmployeeTaskByAdminController.deleteEmployeeTaskByAdmin(req as Request, res as Response);
        await flushMicrotasks();

        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_TASK_ERROR_MESSAGE.EMPLOYEE_TASK_DELETE_ERROR_MESSAGE,
        });
    });
});