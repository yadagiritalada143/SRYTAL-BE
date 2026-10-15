"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getPackageDetailsByAdminController_1 = __importDefault(require("../../../controllers/admin/getPackageDetailsByAdminController"));
const getPackageDetailsByAdminService_1 = __importDefault(require("../../../services/admin/getPackageDetailsByAdminService"));
const packageMessages_1 = require("../../../constants/admin/packageMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getPackageDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        getPackageDetailsByAdmin: jest.fn()
    }
}));
const getPackageDetailsByAdminServiceMock = getPackageDetailsByAdminService_1.default.getPackageDetailsByAdmin;
describe('getPackageDetailsByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getPackageDetailsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the package details when the service resolves', async () => {
        const req = { params: { id: 'p1' } };
        const fetchResponse = { success: true, packageDetails: { _id: 'p1', name: 'Premium' } };
        getPackageDetailsByAdminServiceMock.mockResolvedValue(fetchResponse);
        await getPackageDetailsByAdminController_1.default.getPackageDetailsByAdmin(req, res);
        expect(getPackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getPackageDetailsByAdminServiceMock).toHaveBeenCalledWith('p1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { id: 'p1' } };
        getPackageDetailsByAdminServiceMock.mockRejectedValue({ success: false });
        await getPackageDetailsByAdminController_1.default.getPackageDetailsByAdmin(req, res);
        expect(getPackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});
