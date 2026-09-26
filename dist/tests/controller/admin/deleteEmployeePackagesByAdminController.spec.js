"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeePackagesByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteEmployeePackagesByAdminController"));
const deleteEmployeePackagesByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeePackagesByAdminService"));
const employeePackageMessages_1 = require("../../../constants/admin/employeePackageMessages");
jest.mock('../../../services/admin/deleteEmployeePackagesByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmployeePackageServiceByAdmin: jest.fn(),
    },
}));
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteEmployeePackagesByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { employeeId: 'e1', packageId: 'p1' } };
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
        deleteEmployeePackagesByAdminService_1.default.deleteEmployeePackageServiceByAdmin.mockResolvedValue(response);
        deleteEmployeePackagesByAdminController_1.default.deleteEmployeePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(deleteEmployeePackagesByAdminService_1.default.deleteEmployeePackageServiceByAdmin).toHaveBeenCalledWith('e1', 'p1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('responds with 500 and the delete error message on failure', async () => {
        deleteEmployeePackagesByAdminService_1.default.deleteEmployeePackageServiceByAdmin.mockRejectedValue({ success: false });
        deleteEmployeePackagesByAdminController_1.default.deleteEmployeePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: employeePackageMessages_1.EMPLOYEE_PACKAGE_ERROR_MESSAGES.EMPLOYEE_PACKAGE_DELETE_ERROR_MESSAGE,
        });
    });
});
