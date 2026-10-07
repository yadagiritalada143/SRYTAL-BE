"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteDepartmentByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteDepartmentByAdminController"));
const deleteDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/deleteDepartmentByAdminService"));
const departmentMessages_1 = require("../../../constants/admin/departmentMessages");
jest.mock('../../../services/admin/deleteDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        deleteDepartmentByAdmin: jest.fn()
    }
}));
const deleteDepartmentByAdminServiceMock = deleteDepartmentByAdminService_1.default.deleteDepartmentByAdmin;
describe('deleteDepartmentByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        deleteDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('deletes a department successfully and returns 200 with the success message', async () => {
        const req = { params: { _id: 'dept123' } };
        deleteDepartmentByAdminServiceMock.mockResolvedValue({ success: true });
        await deleteDepartmentByAdminController_1.default.deleteDepartmentByAdmin(req, res);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_DELETE_SUCCESS_MESSAGE
        });
    });
    it('passes an undefined id through when the params do not contain an id', async () => {
        const req = { params: {} };
        deleteDepartmentByAdminServiceMock.mockResolvedValue({ success: true });
        await deleteDepartmentByAdminController_1.default.deleteDepartmentByAdmin(req, res);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { _id: 'dept123' } };
        deleteDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await deleteDepartmentByAdminController_1.default.deleteDepartmentByAdmin(req, res);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_DELETE_ERROR_MESSAGE
        });
    });
});
