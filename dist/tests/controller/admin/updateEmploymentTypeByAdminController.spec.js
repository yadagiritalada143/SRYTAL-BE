"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmploymentTypeByAdminController_1 = __importDefault(require("../../../controllers/admin/updateEmploymentTypeByAdminController"));
const updateEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/updateEmploymentTypeByAdminService"));
const employementTypesMessages_1 = require("../../../constants/admin/employementTypesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        updateEmploymentTypeByAdmin: jest.fn()
    }
}));
const updateEmploymentTypeByAdminServiceMock = updateEmploymentTypeByAdminService_1.default.updateEmploymentTypeByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateEmploymentType controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateEmploymentTypeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'et1', employmentType: 'Contract' } };
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateEmploymentTypeByAdminServiceMock.mockResolvedValue(updateResponse);
        await updateEmploymentTypeByAdminController_1.default.updateEmploymentType(req, res);
        await flushMicrotasks();
        expect(updateEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('et1', 'Contract');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'et1', employmentType: 'Contract' } };
        updateEmploymentTypeByAdminServiceMock.mockRejectedValue({ success: false });
        await updateEmploymentTypeByAdminController_1.default.updateEmploymentType(req, res);
        await flushMicrotasks();
        expect(updateEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UPDATING_ERROR_MESSAGE
        });
    });
});
