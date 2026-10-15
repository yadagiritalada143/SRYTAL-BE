"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getEmployeeDashboardController_1 = __importDefault(require("../../../controllers/common/getEmployeeDashboardController"));
const getEmployeeDashboardService_1 = __importDefault(require("../../../services/common/getEmployeeDashboardService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/common/getEmployeeDashboardService', () => ({
    __esModule: true,
    default: { getEmployeeDashboard: jest.fn() }
}));
const getEmployeeDashboardServiceMock = getEmployeeDashboardService_1.default.getEmployeeDashboard;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getEmployeeDashboardController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getEmployeeDashboardServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the dashboard data on success', async () => {
        const req = { user: { userId: 'u1' } };
        const dashboardResponse = { success: true, stats: {}, profile: {} };
        getEmployeeDashboardServiceMock.mockResolvedValue(dashboardResponse);
        await getEmployeeDashboardController_1.default.getEmployeeDashboard(req, res);
        await flushMicrotasks();
        expect(getEmployeeDashboardServiceMock).toHaveBeenCalledWith('u1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(dashboardResponse);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'u1' } };
        getEmployeeDashboardServiceMock.mockRejectedValue(new Error('boom'));
        await getEmployeeDashboardController_1.default.getEmployeeDashboard(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_DASHBOARD_FETCHING_ERROR
        });
    });
    it('calls the service with undefined when the request has no user', async () => {
        const req = {};
        getEmployeeDashboardServiceMock.mockResolvedValue({ success: true });
        await getEmployeeDashboardController_1.default.getEmployeeDashboard(req, res);
        await flushMicrotasks();
        expect(getEmployeeDashboardServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
});
