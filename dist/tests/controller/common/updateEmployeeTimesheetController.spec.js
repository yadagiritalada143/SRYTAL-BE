"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmployeeTimesheetController_1 = __importDefault(require("../../../controllers/common/updateEmployeeTimesheetController"));
const updateEmployeeTimesheetService_1 = __importDefault(require("../../../services/common/updateEmployeeTimesheetService"));
const employeeTimesheetErrorMessage_1 = require("../../../constants/common/employeeTimesheetErrorMessage");
jest.mock('../../../services/common/updateEmployeeTimesheetService', () => ({
    __esModule: true,
    default: { updateEmployeeTimesheet: jest.fn() }
}));
const updateEmployeeTimesheetServiceMock = updateEmployeeTimesheetService_1.default.updateEmployeeTimesheet;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateEmployeeTimesheetController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateEmployeeTimesheetServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('uses the employeeId from the body when present', async () => {
        const req = {
            body: { packages: [{ packageId: 'p1' }], employeeId: 'emp2', userId: 'emp1' }
        };
        const response = { success: true };
        updateEmployeeTimesheetServiceMock.mockResolvedValue(response);
        await updateEmployeeTimesheetController_1.default.updateEmployeeTimesheet(req, res);
        await flushMicrotasks();
        expect(updateEmployeeTimesheetServiceMock).toHaveBeenCalledWith({
            packages: [{ packageId: 'p1' }],
            employeeId: 'emp2'
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(response);
    });
    it('falls back to the userId when no employeeId is provided', async () => {
        const req = {
            body: { packages: [{ packageId: 'p1' }], userId: 'emp1' }
        };
        updateEmployeeTimesheetServiceMock.mockResolvedValue({ success: true });
        await updateEmployeeTimesheetController_1.default.updateEmployeeTimesheet(req, res);
        await flushMicrotasks();
        expect(updateEmployeeTimesheetServiceMock).toHaveBeenCalledWith({
            packages: [{ packageId: 'p1' }],
            employeeId: 'emp1'
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { packages: [{ packageId: 'p1' }], employeeId: 'emp1' }
        };
        updateEmployeeTimesheetServiceMock.mockRejectedValue(new Error('boom'));
        await updateEmployeeTimesheetController_1.default.updateEmployeeTimesheet(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeTimesheetErrorMessage_1.UPDATE_EMPLOYEE_TIMESHEET_ERRORS_MESSAGES.EMPLOYEE_TIMESHEET_UPDATING_ERROR_MESSAGE
        });
    });
});
