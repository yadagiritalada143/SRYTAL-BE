"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addPackageToEmployeeByAdminController_1 = __importDefault(require("../../../controllers/admin/addPackageToEmployeeByAdminController"));
const addPackageToEmployeeByAdminService_1 = __importDefault(require("../../../services/admin/addPackageToEmployeeByAdminService"));
const packageToEmployeeMessage_1 = require("../../../constants/admin/packageToEmployeeMessage");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/addPackageToEmployeeByAdminService', () => ({
    __esModule: true,
    default: {
        addPackagetoEmployeeByAdmin: jest.fn()
    }
}));
const addPackagetoEmployeeByAdminServiceMock = addPackageToEmployeeByAdminService_1.default.addPackagetoEmployeeByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addPackageToEmployeeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addPackagetoEmployeeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the success response when the package is assigned to the employee', async () => {
        const req = { body: { employeeId: 'e1', packageId: 'p1' } };
        addPackagetoEmployeeByAdminServiceMock.mockResolvedValue({ _id: 'ep1' });
        await addPackageToEmployeeByAdminController_1.default.addPackageToEmployeeByAdmin(req, res);
        await flushMicrotasks();
        expect(addPackagetoEmployeeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addPackagetoEmployeeByAdminServiceMock).toHaveBeenCalledWith({ employeeId: 'e1', packageId: 'p1' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ succes: true });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { employeeId: 'e1', packageId: 'p1' } };
        addPackagetoEmployeeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await addPackageToEmployeeByAdminController_1.default.addPackageToEmployeeByAdmin(req, res);
        await flushMicrotasks();
        expect(addPackagetoEmployeeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: packageToEmployeeMessage_1.PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE.ADD_PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE
        });
    });
});
