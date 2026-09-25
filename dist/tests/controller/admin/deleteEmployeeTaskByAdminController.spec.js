"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeTaskByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteEmployeeTaskByAdminController"));
const deleteEmployeeTaskByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeeTaskByAdminService"));
const employeePackageMessages_1 = require("../../../constants/admin/employeePackageMessages");
jest.mock('../../../services/admin/deleteEmployeeTaskByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmployeeTaskServiceByAdmin: jest.fn(),
    },
}));
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteEmployeeTaskByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { employeeId: 'e1', packageId: 'p1', taskId: 't1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('responds with 200 and the delete response on success', async () => {
        const response = { success: true, responseAfterDelete: {} };
        deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin.mockResolvedValue(response);
        deleteEmployeeTaskByAdminController_1.default.deleteEmployeeTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin).toHaveBeenCalledWith('e1', 'p1', 't1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('responds with 500 and the task delete error message on failure', async () => {
        deleteEmployeeTaskByAdminService_1.default.deleteEmployeeTaskServiceByAdmin.mockRejectedValue({ success: false });
        deleteEmployeeTaskByAdminController_1.default.deleteEmployeeTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: employeePackageMessages_1.EMPLOYEE_TASK_ERROR_MESSAGE.EMPLOYEE_TASK_DELETE_ERROR_MESSAGE,
        });
    });
});
