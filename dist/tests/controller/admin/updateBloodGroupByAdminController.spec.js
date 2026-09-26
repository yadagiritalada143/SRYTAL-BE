"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateBloodGroupByAdminController_1 = __importDefault(require("../../../controllers/admin/updateBloodGroupByAdminController"));
const updateBloodGroupByAdminService_1 = __importDefault(require("../../../services/admin/updateBloodGroupByAdminService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateBloodGroupByAdminService', () => ({
    __esModule: true,
    default: {
        updateBloodGroupByAdmin: jest.fn()
    }
}));
const updateBloodGroupByAdminServiceMock = updateBloodGroupByAdminService_1.default.updateBloodGroupByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateBloodGroup controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateBloodGroupByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'bg1', type: 'AB+' } };
        const updateResponse = { success: true, responseAfterupdate: { modifiedCount: 1 } };
        updateBloodGroupByAdminServiceMock.mockResolvedValue(updateResponse);
        await updateBloodGroupByAdminController_1.default.updateBloodGroup(req, res);
        await flushMicrotasks();
        expect(updateBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateBloodGroupByAdminServiceMock).toHaveBeenCalledWith('bg1', 'AB+');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'bg1', type: 'AB+' } };
        updateBloodGroupByAdminServiceMock.mockRejectedValue({ success: false });
        await updateBloodGroupByAdminController_1.default.updateBloodGroup(req, res);
        await flushMicrotasks();
        expect(updateBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_BLOOD_GROUP_DETAILS
        });
    });
});
