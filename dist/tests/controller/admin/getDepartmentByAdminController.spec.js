"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDepartmentByAdminController_1 = __importDefault(require("../../../controllers/admin/getDepartmentByAdminController"));
const getDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/getDepartmentByAdminService"));
const departmentMessages_1 = require("../../../constants/admin/departmentMessages");
jest.mock('../../../services/admin/getDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        getDepartmentByAdmin: jest.fn()
    }
}));
const getDepartmentByAdminServiceMock = getDepartmentByAdminService_1.default.getDepartmentByAdmin;
describe('getDepartmentByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the department details with 200 when the department exists', async () => {
        const req = { params: { _id: 'dept123' } };
        const department = { _id: 'dept123', departmentName: 'Engineering' };
        getDepartmentByAdminServiceMock.mockResolvedValue(department);
        await getDepartmentByAdminController_1.default.getDepartmentByAdmin(req, res);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.FETCH_DEPARTMENT_SUCCESS_MESSAGE,
            data: department
        });
    });
    it('returns 404 with the not-found message when the department does not exist', async () => {
        const req = { params: { _id: 'unknown' } };
        getDepartmentByAdminServiceMock.mockResolvedValue(null);
        await getDepartmentByAdminController_1.default.getDepartmentByAdmin(req, res);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledWith('unknown');
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_NOT_FOUND_ERROR_MESSAGE
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { _id: 'dept123' } };
        getDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await getDepartmentByAdminController_1.default.getDepartmentByAdmin(req, res);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.FETCH_DEPARTMENT_ERROR_MESSAGE
        });
    });
});
