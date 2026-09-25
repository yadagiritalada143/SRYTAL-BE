"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addEmployeeRoleByAdminController_1 = __importDefault(require("../../../controllers/admin/addEmployeeRoleByAdminController"));
const addEmployeeRoleByAdminService_1 = __importDefault(require("../../../services/admin/addEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../../constants/admin/employeeRolesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/addEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        addEmployeeRoleByAdmin: jest.fn()
    }
}));
const addEmployeeRoleByAdminServiceMock = addEmployeeRoleByAdminService_1.default.addEmployeeRoleByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addEmployeeRoleByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addEmployeeRoleByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 201 with the success message when the employee role is saved with an id', async () => {
        const req = { body: { designation: 'Software Engineer' } };
        addEmployeeRoleByAdminServiceMock.mockResolvedValue({ id: 'role123', designation: 'Software Engineer' });
        await addEmployeeRoleByAdminController_1.default.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('Software Engineer');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: employeeRolesMessages_1.EMPLOYEE_ROLE_SUCCESS_MESSAGES.EMPLOYEE_ROLE_ADD_SUCCESS_MESSAGE
        });
    });
    it('returns 400 with the error message when the saved employee role has no id', async () => {
        const req = { body: { designation: 'Software Engineer' } };
        addEmployeeRoleByAdminServiceMock.mockResolvedValue({ success: false });
        await addEmployeeRoleByAdminController_1.default.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('Software Engineer');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_ADD_ERROR_MESSAGE
        });
    });
    it('passes undefined through when the body does not contain a designation', async () => {
        const req = { body: {} };
        addEmployeeRoleByAdminServiceMock.mockResolvedValue({ id: 'role123' });
        await addEmployeeRoleByAdminController_1.default.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
    });
    it('sends no response and logs the error when the service throws', async () => {
        const req = { body: { designation: 'Software Engineer' } };
        addEmployeeRoleByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        await addEmployeeRoleByAdminController_1.default.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('Software Engineer');
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
        expect(mockJson).not.toHaveBeenCalled();
    });
});
