"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmployeeRoleByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllEmployeeRoleByAdminController"));
const getAllEmployeeRoleByAdminService_1 = __importDefault(require("../../../services/admin/getAllEmployeeRoleByAdminService"));
const employeeRolesMessages_1 = require("../../../constants/admin/employeeRolesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getAllEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        getAllEmployeeRolesByAdmin: jest.fn()
    }
}));
const getAllEmployeeRolesByAdminServiceMock = getAllEmployeeRoleByAdminService_1.default.getAllEmployeeRolesByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getAllEmployeeRolesByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllEmployeeRolesByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the fetched employee roles response when the service resolves', async () => {
        const req = {};
        const fetchResponse = { success: true, employeeRoles: [{ _id: 'role1', designation: 'Software Engineer' }] };
        getAllEmployeeRolesByAdminServiceMock.mockResolvedValue(fetchResponse);
        await getAllEmployeeRoleByAdminController_1.default.getAllEmployeeRolesByAdmin(req, res);
        await flushMicrotasks();
        expect(getAllEmployeeRolesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {};
        getAllEmployeeRolesByAdminServiceMock.mockRejectedValue({ success: false });
        await getAllEmployeeRoleByAdminController_1.default.getAllEmployeeRolesByAdmin(req, res);
        await flushMicrotasks();
        expect(getAllEmployeeRolesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeRolesMessages_1.EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_FETCH_ERROR_MESSAGES
        });
    });
});
