"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeRoleByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteEmployeeRoleByAdminController"));
const deleteEmployeeRoleByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../../constants/admin/employeeRolesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/deleteEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmployeeRoleByAdmin: jest.fn()
    }
}));
const deleteEmployeeRoleByAdminServiceMock = deleteEmployeeRoleByAdminService_1.default.deleteEmployeeRoleByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteEmployeeRole controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        deleteEmployeeRoleByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the delete response when the service resolves', async () => {
        const req = { params: { id: 'r1' } };
        const deleteResponse = { success: true, responseAfterDelete: { _id: 'r1' } };
        deleteEmployeeRoleByAdminServiceMock.mockResolvedValue(deleteResponse);
        await deleteEmployeeRoleByAdminController_1.default.deleteEmployeeRole(req, res);
        await flushMicrotasks();
        expect(deleteEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('r1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(deleteResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { id: 'r1' } };
        deleteEmployeeRoleByAdminServiceMock.mockRejectedValue({ success: false });
        await deleteEmployeeRoleByAdminController_1.default.deleteEmployeeRole(req, res);
        await flushMicrotasks();
        expect(deleteEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_DELETE_ERROR_MESSAGE
        });
    });
});
