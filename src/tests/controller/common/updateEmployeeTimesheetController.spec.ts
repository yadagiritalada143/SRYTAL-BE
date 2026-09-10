import { Request, Response } from 'express';
import updateEmployeeTimesheetController from '../../../controllers/common/updateEmployeeTimesheetController';
import updateEmployeeTimesheetService from '../../../services/common/updateEmployeeTimesheetService';
import { UPDATE_EMPLOYEE_TIMESHEET_ERRORS_MESSAGES } from '../../../constants/common/employeeTimesheetErrorMessage';

jest.mock('../../../services/common/updateEmployeeTimesheetService', () => ({
    __esModule: true,
    default: { updateEmployeeTimesheet: jest.fn() }
}));

const updateEmployeeTimesheetServiceMock =
    updateEmployeeTimesheetService.updateEmployeeTimesheet as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateEmployeeTimesheetController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateEmployeeTimesheetServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('uses the employeeId from the body when present', async () => {
        const req = {
            body: { packages: [{ packageId: 'p1' }], employeeId: 'emp2', userId: 'emp1' }
        } as unknown as Request;
        const response = { success: true };
        updateEmployeeTimesheetServiceMock.mockResolvedValue(response);

        await updateEmployeeTimesheetController.updateEmployeeTimesheet(req, res);
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
        } as unknown as Request;
        updateEmployeeTimesheetServiceMock.mockResolvedValue({ success: true });

        await updateEmployeeTimesheetController.updateEmployeeTimesheet(req, res);
        await flushMicrotasks();

        expect(updateEmployeeTimesheetServiceMock).toHaveBeenCalledWith({
            packages: [{ packageId: 'p1' }],
            employeeId: 'emp1'
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { packages: [{ packageId: 'p1' }], employeeId: 'emp1' }
        } as unknown as Request;
        updateEmployeeTimesheetServiceMock.mockRejectedValue(new Error('boom'));

        await updateEmployeeTimesheetController.updateEmployeeTimesheet(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: UPDATE_EMPLOYEE_TIMESHEET_ERRORS_MESSAGES.EMPLOYEE_TIMESHEET_UPDATING_ERROR_MESSAGE
        });
    });
});