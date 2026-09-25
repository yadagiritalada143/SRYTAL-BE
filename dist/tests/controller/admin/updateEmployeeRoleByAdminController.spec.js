"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmployeeRoleByAdminController_1 = __importDefault(require("../../../controllers/admin/updateEmployeeRoleByAdminController"));
const updateEmployeeRoleByAdminService_1 = __importDefault(require("../../../services/admin/updateEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../../constants/admin/employeeRolesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        updateEmployeeRoleByAdmin: jest.fn()
    }
}));
const updateEmployeeRoleByAdminServiceMock = updateEmployeeRoleByAdminService_1.default.updateEmployeeRoleByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateEmployeeRole controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateEmployeeRoleByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'r1', designation: 'Manager' } };
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateEmployeeRoleByAdminServiceMock.mockResolvedValue(updateResponse);
        await updateEmployeeRoleByAdminController_1.default.updateEmployeeRole(req, res);
        await flushMicrotasks();
        expect(updateEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('r1', 'Manager');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'r1', designation: 'Manager' } };
        updateEmployeeRoleByAdminServiceMock.mockRejectedValue({ success: false });
        await updateEmployeeRoleByAdminController_1.default.updateEmployeeRole(req, res);
        await flushMicrotasks();
        expect(updateEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_UPDATING_ERROR_MESSAGE
        });
    });
});
