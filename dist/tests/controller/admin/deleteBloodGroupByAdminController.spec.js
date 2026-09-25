"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteBloodGroupByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteBloodGroupByAdminController"));
const deleteBloodGroupByAdminService_1 = __importDefault(require("../../../services/admin/deleteBloodGroupByAdminService"));
const manageUserMessages_1 = require("../../../constants/admin/manageUserMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/deleteBloodGroupByAdminService', () => ({
    __esModule: true,
    default: {
        deleteBloodGroupByAdmin: jest.fn()
    }
}));
const deleteBloodGroupByAdminServiceMock = deleteBloodGroupByAdminService_1.default.deleteBloodGroupByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteBloodGroup controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        deleteBloodGroupByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the delete response when the service resolves', async () => {
        const req = { params: { id: 'bg1' } };
        const deleteResponse = { success: true, responseAfterDelete: { _id: 'bg1' } };
        deleteBloodGroupByAdminServiceMock.mockResolvedValue(deleteResponse);
        await deleteBloodGroupByAdminController_1.default.deleteBloodGroup(req, res);
        await flushMicrotasks();
        expect(deleteBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteBloodGroupByAdminServiceMock).toHaveBeenCalledWith('bg1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(deleteResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { id: 'bg1' } };
        deleteBloodGroupByAdminServiceMock.mockRejectedValue({ success: false });
        await deleteBloodGroupByAdminController_1.default.deleteBloodGroup(req, res);
        await flushMicrotasks();
        expect(deleteBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE
        });
    });
});
