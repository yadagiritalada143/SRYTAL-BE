"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePackageByAdminController_1 = __importDefault(require("../../../controllers/admin/updatePackageByAdminController"));
const updatePackageByAdminService_1 = __importDefault(require("../../../services/admin/updatePackageByAdminService"));
const packageMessages_1 = require("../../../constants/admin/packageMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updatePackageByAdminService', () => ({
    __esModule: true,
    default: {
        updatePackageByAdmin: jest.fn()
    }
}));
const updatePackageByAdminServiceMock = updatePackageByAdminService_1.default.updatePackageByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updatePackageByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updatePackageByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'p1', detailsToUpdate: { name: 'Premium' } } };
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updatePackageByAdminServiceMock.mockResolvedValue(updateResponse);
        await updatePackageByAdminController_1.default.updatePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(updatePackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updatePackageByAdminServiceMock).toHaveBeenCalledWith('p1', { name: 'Premium' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'p1', detailsToUpdate: { name: 'Premium' } } };
        updatePackageByAdminServiceMock.mockRejectedValue({ success: false });
        await updatePackageByAdminController_1.default.updatePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(updatePackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_UPDATING_ERROR_MESSAGE
        });
    });
});
