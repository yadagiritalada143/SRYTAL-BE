"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getEmployeeDetailsController_1 = __importDefault(require("../../../controllers/common/getEmployeeDetailsController"));
const getEmployeeDetailsService_1 = __importDefault(require("../../../services/common/getEmployeeDetailsService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/common/getEmployeeDetailsService', () => ({
    __esModule: true,
    default: { getEmployeeDetails: jest.fn() }
}));
const getEmployeeDetailsServiceMock = getEmployeeDetailsService_1.default.getEmployeeDetails;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getEmployeeDetailsController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getEmployeeDetailsServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the employee details on success', async () => {
        const req = { user: { userId: 'u1' } };
        const detailsResponse = { success: true, employeeDetails: { id: 'u1' } };
        getEmployeeDetailsServiceMock.mockResolvedValue(detailsResponse);
        await getEmployeeDetailsController_1.default.getEmployeeDetails(req, res);
        await flushMicrotasks();
        expect(getEmployeeDetailsServiceMock).toHaveBeenCalledWith('u1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(detailsResponse);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'u1' } };
        getEmployeeDetailsServiceMock.mockRejectedValue(new Error('boom'));
        await getEmployeeDetailsController_1.default.getEmployeeDetails(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_DETAILS_FETCHING_ERROR
        });
    });
    it('calls the service with undefined when the request has no user', async () => {
        const req = {};
        getEmployeeDetailsServiceMock.mockResolvedValue({ success: true, employeeDetails: {} });
        await getEmployeeDetailsController_1.default.getEmployeeDetails(req, res);
        await flushMicrotasks();
        expect(getEmployeeDetailsServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
});
