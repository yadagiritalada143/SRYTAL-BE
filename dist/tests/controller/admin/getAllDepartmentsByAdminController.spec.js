"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllDepartmentsByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllDepartmentsByAdminController"));
const getAllDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/getAllDepartmentByAdminService"));
const departmentMessages_1 = require("../../../constants/admin/departmentMessages");
jest.mock('../../../services/admin/getAllDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        getAllDepartmentsByAdmin: jest.fn()
    }
}));
const getAllDepartmentsByAdminServiceMock = getAllDepartmentByAdminService_1.default.getAllDepartmentsByAdmin;
describe('getAllDepartmentsByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllDepartmentsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the departments when the service resolves', async () => {
        const req = {};
        const departments = [{ _id: 'd1', department: 'Engineering' }];
        getAllDepartmentsByAdminServiceMock.mockResolvedValue(departments);
        await getAllDepartmentsByAdminController_1.default.getAllDepartmentsByAdmin(req, res);
        expect(getAllDepartmentsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.FETCH_ALL_DEPARTMENTS_SUCCESS_MESSAGE,
            data: departments
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {};
        getAllDepartmentsByAdminServiceMock.mockRejectedValue({ success: false });
        await getAllDepartmentsByAdminController_1.default.getAllDepartmentsByAdmin(req, res);
        expect(getAllDepartmentsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.FETCH_ALL_DEPARTMENTS_ERROR_MESSAGE
        });
    });
});
