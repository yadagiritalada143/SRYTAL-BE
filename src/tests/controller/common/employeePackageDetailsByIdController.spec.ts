import { Request, Response } from 'express';
import employeePackageDetailsByIdController from '../../../controllers/common/employeePackageDetailsByIdController';
import employeePackageDetailsByIdService from '../../../services/common/employeePackageDetailsByIdService';
import { PACKAGE_ERROR_MESSAGES } from '../../../constants/admin/packageMessages';

jest.mock('../../../services/common/employeePackageDetailsByIdService', () => ({
    __esModule: true,
    default: { employeePackageDetailsById: jest.fn() }
}));

const employeePackageDetailsByIdMock = employeePackageDetailsByIdService.employeePackageDetailsById as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('employeePackageDetailsByIdController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        employeePackageDetailsByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when dates are missing', async () => {
        const req = { body: { userId: 'u1' } } as unknown as Request;

        await employeePackageDetailsByIdController.employeePackageDetailsById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'FROM date and TO date are required !!'
        });
    });

    it('returns 200 using the provided employeeId', async () => {
        const req = {
            body: { userId: 'u1', employeeId: 'u2', startDate: '2026-01-10', endDate: '2026-01-20' }
        } as unknown as Request;
        const response = { success: true, employeePackageDetails: [] };
        employeePackageDetailsByIdMock.mockResolvedValue(response);

        await employeePackageDetailsByIdController.employeePackageDetailsById(req, res);
        await flushMicrotasks();

        expect(employeePackageDetailsByIdMock).toHaveBeenCalledWith('u2', '2026-01-10', '2026-01-20');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(response);
    });

    it('returns 200 using the userId when no employeeId is given', async () => {
        const req = {
            body: { userId: 'u1', startDate: '2026-01-10', endDate: '2026-01-20' }
        } as unknown as Request;
        const response = { success: true, employeePackageDetails: [] };
        employeePackageDetailsByIdMock.mockResolvedValue(response);

        await employeePackageDetailsByIdController.employeePackageDetailsById(req, res);
        await flushMicrotasks();

        expect(employeePackageDetailsByIdMock).toHaveBeenCalledWith('u1', '2026-01-10', '2026-01-20');
        expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { userId: 'u1', startDate: '2026-01-10', endDate: '2026-01-20' }
        } as unknown as Request;
        employeePackageDetailsByIdMock.mockRejectedValue(new Error('boom'));

        await employeePackageDetailsByIdController.employeePackageDetailsById(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});