"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmploymentTypeByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteEmploymentTypeByAdminController"));
const deleteEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmploymentTypeByAdminService"));
const employementTypesMessages_1 = require("../../../constants/admin/employementTypesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/deleteEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmploymentTypeByAdmin: jest.fn()
    }
}));
const deleteEmploymentTypeByAdminServiceMock = deleteEmploymentTypeByAdminService_1.default.deleteEmploymentTypeByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteEmploymentType controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        deleteEmploymentTypeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the delete response when the service resolves', async () => {
        const req = { params: { id: 'et1' } };
        const deleteResponse = { success: true, responseAfterDelete: { _id: 'et1' } };
        deleteEmploymentTypeByAdminServiceMock.mockResolvedValue(deleteResponse);
        await deleteEmploymentTypeByAdminController_1.default.deleteEmploymentType(req, res);
        await flushMicrotasks();
        expect(deleteEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('et1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(deleteResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { id: 'et1' } };
        deleteEmploymentTypeByAdminServiceMock.mockRejectedValue({ success: false });
        await deleteEmploymentTypeByAdminController_1.default.deleteEmploymentType(req, res);
        await flushMicrotasks();
        expect(deleteEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_DELETE_ERROR_MESSAGE
        });
    });
});
