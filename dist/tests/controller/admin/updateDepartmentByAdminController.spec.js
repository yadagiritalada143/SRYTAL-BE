"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateDepartmentByAdminController_1 = __importDefault(require("../../../controllers/admin/updateDepartmentByAdminController"));
const updateDepartmentByAdminService_1 = __importDefault(require("../../../services/admin/updateDepartmentByAdminService"));
const departmentMessages_1 = require("../../../constants/admin/departmentMessages");
jest.mock('../../../services/admin/updateDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        updateDepartmentByAdmin: jest.fn()
    }
}));
const updateDepartmentByAdminServiceMock = updateDepartmentByAdminService_1.default.updateDepartmentByAdmin;
describe('updateDepartmentByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates a department successfully and returns 200 with the success message', async () => {
        const req = { body: { _id: 'dept123', departmentName: 'Engineering' } };
        updateDepartmentByAdminServiceMock.mockResolvedValue({ success: true });
        await updateDepartmentByAdminController_1.default.updateDepartmentByAdmin(req, res);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123', 'Engineering');
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: departmentMessages_1.DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_UPDATE_SUCCESS_MESSAGE
        });
    });
    it('passes undefined values through when the body does not contain an id or name', async () => {
        const req = { body: {} };
        updateDepartmentByAdminServiceMock.mockResolvedValue({ success: true });
        await updateDepartmentByAdminController_1.default.updateDepartmentByAdmin(req, res);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledWith(undefined, undefined);
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { _id: 'dept123', departmentName: 'Engineering' } };
        updateDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await updateDepartmentByAdminController_1.default.updateDepartmentByAdmin(req, res);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(departmentMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: departmentMessages_1.DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_UPDATE_ERROR_MESSAGE
        });
    });
});
