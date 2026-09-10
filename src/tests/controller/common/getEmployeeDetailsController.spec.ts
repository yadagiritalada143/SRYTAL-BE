import { Request, Response } from 'express';
import getEmployeeDetailsController from '../../../controllers/common/getEmployeeDetailsController';
import getEmployeeDetailsService from '../../../services/common/getEmployeeDetailsService';
import { EMPLOYEE_ERRORS, HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/getEmployeeDetailsService', () => ({
    __esModule: true,
    default: { getEmployeeDetails: jest.fn() }
}));

const getEmployeeDetailsServiceMock = getEmployeeDetailsService.getEmployeeDetails as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getEmployeeDetailsController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getEmployeeDetailsServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the employee details on success', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        const detailsResponse = { success: true, employeeDetails: { id: 'u1' } };
        getEmployeeDetailsServiceMock.mockResolvedValue(detailsResponse);

        await getEmployeeDetailsController.getEmployeeDetails(req, res);
        await flushMicrotasks();

        expect(getEmployeeDetailsServiceMock).toHaveBeenCalledWith('u1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(detailsResponse);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        getEmployeeDetailsServiceMock.mockRejectedValue(new Error('boom'));

        await getEmployeeDetailsController.getEmployeeDetails(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ERRORS.EMPLOYEE_DETAILS_FETCHING_ERROR
        });
    });

    it('calls the service with undefined when the request has no user', async () => {
        const req = {} as unknown as Request;
        getEmployeeDetailsServiceMock.mockResolvedValue({ success: true, employeeDetails: {} });

        await getEmployeeDetailsController.getEmployeeDetails(req, res);
        await flushMicrotasks();

        expect(getEmployeeDetailsServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
});