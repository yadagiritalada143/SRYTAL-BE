"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllPackagesByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllPackagesByAdminController"));
const getAllPackagesByAdminService_1 = __importDefault(require("../../../services/admin/getAllPackagesByAdminService"));
const packageMessages_1 = require("../../../constants/admin/packageMessages");
jest.mock('../../../services/admin/getAllPackagesByAdminService', () => ({
    __esModule: true,
    default: {
        getAllPackagesWithTasksByAdmin: jest.fn()
    }
}));
const getAllPackagesWithTasksByAdminServiceMock = getAllPackagesByAdminService_1.default.getAllPackagesWithTasksByAdmin;
describe('getAllPackagesDetails controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllPackagesWithTasksByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the fetched packages response when the service resolves', async () => {
        const req = {};
        const fetchResponse = { success: true, packagesList: [{ _id: 'p1', name: 'Premium', tasks: [] }] };
        getAllPackagesWithTasksByAdminServiceMock.mockResolvedValue(fetchResponse);
        await getAllPackagesByAdminController_1.default.getAllPackagesDetails(req, res);
        expect(getAllPackagesWithTasksByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(packageMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {};
        getAllPackagesWithTasksByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await getAllPackagesByAdminController_1.default.getAllPackagesDetails(req, res);
        expect(getAllPackagesWithTasksByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(packageMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE
        });
    });
});
