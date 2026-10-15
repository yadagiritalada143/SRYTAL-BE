"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getEmployeePackagesByAdminController_1 = __importDefault(require("../../../controllers/admin/getEmployeePackagesByAdminController"));
const getEmployeePackagesByAdminService_1 = __importDefault(require("../../../services/admin/getEmployeePackagesByAdminService"));
const packageMessages_1 = require("../../../constants/admin/packageMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getEmployeePackagesByAdminService', () => ({
    __esModule: true,
    default: {
        getEmployeePackageDetailsByAdmin: jest.fn()
    }
}));
const getEmployeePackageDetailsByAdminServiceMock = getEmployeePackagesByAdminService_1.default.getEmployeePackageDetailsByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getEmployeePackageDetailsByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getEmployeePackageDetailsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the employee package details when the service resolves', async () => {
        const req = { params: { employeeId: 'e1' } };
        const fetchResponse = { success: true, employeePackageDetails: [{ _id: 'ep1' }] };
        getEmployeePackageDetailsByAdminServiceMock.mockResolvedValue(fetchResponse);
        await getEmployeePackagesByAdminController_1.default.getEmployeePackageDetailsByAdmin(req, res);
        await flushMicrotasks();
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledWith('e1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });
    it('passes an undefined employee id through when params are missing', async () => {
        const req = { params: {} };
        getEmployeePackageDetailsByAdminServiceMock.mockResolvedValue({ success: true, employeePackageDetails: [] });
        await getEmployeePackagesByAdminController_1.default.getEmployeePackageDetailsByAdmin(req, res);
        await flushMicrotasks();
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { employeeId: 'e1' } };
        getEmployeePackageDetailsByAdminServiceMock.mockRejectedValue({ success: false });
        await getEmployeePackagesByAdminController_1.default.getEmployeePackageDetailsByAdmin(req, res);
        await flushMicrotasks();
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageMessages_1.PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});
