"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addPackageByAdminController_1 = __importDefault(require("../../../controllers/admin/addPackageByAdminController"));
const addPackageByAdminService_1 = __importDefault(require("../../../services/admin/addPackageByAdminService"));
const packageMessages_1 = require("../../../constants/admin/packageMessages");
jest.mock('../../../services/admin/addPackageByAdminService', () => ({
    __esModule: true,
    default: {
        addPackageByAdmin: jest.fn()
    }
}));
const addPackageByAdminServiceMock = addPackageByAdminService_1.default.addPackageByAdmin;
describe('addPackageByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addPackageByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('adds a package successfully, flags it as not deleted, and returns 200 with the success message', async () => {
        const req = { body: { name: 'Premium', amount: 1000 } };
        addPackageByAdminServiceMock.mockResolvedValue(undefined);
        await addPackageByAdminController_1.default.addPackageByAdmin(req, res);
        expect(req.body).toEqual({ name: 'Premium', amount: 1000, isDeleted: false });
        expect(addPackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addPackageByAdminServiceMock).toHaveBeenCalledWith({ name: 'Premium', amount: 1000, isDeleted: false });
        expect(mockStatus).toHaveBeenCalledWith(packageMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: packageMessages_1.PACKAGE_SUCCESS_MESSAGES.PACKAGE_ADD_SUCCESS_MESSAGE
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { name: 'Premium' } };
        addPackageByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await addPackageByAdminController_1.default.addPackageByAdmin(req, res);
        expect(addPackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(packageMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_ADD_ERROR_MESSAGE
        });
    });
});
