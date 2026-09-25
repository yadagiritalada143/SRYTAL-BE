"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePackageByAdminController_1 = __importDefault(require("../../../controllers/admin/deletePackageByAdminController"));
const deletePackageByAdminService_1 = __importDefault(require("../../../services/admin/deletePackageByAdminService"));
const packageMessages_1 = require("../../../constants/admin/packageMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/deletePackageByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeletePackageServiceByAdmin: jest.fn(),
        softDeletePackageServiceByAdmin: jest.fn()
    }
}));
const hardDeletePackageServiceByAdminMock = deletePackageByAdminService_1.default.hardDeletePackageServiceByAdmin;
const softDeletePackageServiceByAdminMock = deletePackageByAdminService_1.default.softDeletePackageServiceByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deletePackageByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        hardDeletePackageServiceByAdminMock.mockReset();
        softDeletePackageServiceByAdminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('performs a hard delete and returns 200 when confirmDelete is true', async () => {
        const req = {
            params: { id: 'p1' },
            body: { confirmDelete: true }
        };
        hardDeletePackageServiceByAdminMock.mockResolvedValue({ success: true });
        await deletePackageByAdminController_1.default.deletePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(hardDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(hardDeletePackageServiceByAdminMock).toHaveBeenCalledWith('p1');
        expect(softDeletePackageServiceByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 500 with the hard delete error when the hard delete fails', async () => {
        const req = {
            params: { id: 'p1' },
            body: { confirmDelete: true }
        };
        hardDeletePackageServiceByAdminMock.mockRejectedValue({ success: false });
        await deletePackageByAdminController_1.default.deletePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(hardDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_HARD_DELETE_ERROR_MESSAGE
        });
    });
    it('performs a soft delete and returns 200 when confirmDelete is falsy', async () => {
        const req = {
            params: { id: 'p1' },
            body: { confirmDelete: false }
        };
        softDeletePackageServiceByAdminMock.mockResolvedValue({ success: true });
        await deletePackageByAdminController_1.default.deletePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(softDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(softDeletePackageServiceByAdminMock).toHaveBeenCalledWith('p1');
        expect(hardDeletePackageServiceByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 500 with the soft delete error when the soft delete fails', async () => {
        const req = {
            params: { id: 'p1' },
            body: {}
        };
        softDeletePackageServiceByAdminMock.mockRejectedValue({ success: false });
        await deletePackageByAdminController_1.default.deletePackageByAdmin(req, res);
        await flushMicrotasks();
        expect(softDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_SOFT_DELETE_ERROR_MESSAGE
        });
    });
});
