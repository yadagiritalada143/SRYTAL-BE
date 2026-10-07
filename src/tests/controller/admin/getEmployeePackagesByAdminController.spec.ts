import { Request, Response } from 'express';
import getEmployeePackagesByAdminController from '../../../controllers/admin/getEmployeePackagesByAdminController';
import getEmployeePackagesByAdminService from '../../../services/admin/getEmployeePackagesByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../../constants/admin/packageMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getEmployeePackagesByAdminService', () => ({
    __esModule: true,
    default: {
        getEmployeePackageDetailsByAdmin: jest.fn()
    }
}));

const getEmployeePackageDetailsByAdminServiceMock =
    getEmployeePackagesByAdminService.getEmployeePackageDetailsByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getEmployeePackageDetailsByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getEmployeePackageDetailsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the employee package details when the service resolves', async () => {
        const req = { params: { employeeId: 'e1' } } as unknown as Request;
        const fetchResponse = { success: true, employeePackageDetails: [{ _id: 'ep1' }] };
        getEmployeePackageDetailsByAdminServiceMock.mockResolvedValue(fetchResponse);

        await getEmployeePackagesByAdminController.getEmployeePackageDetailsByAdmin(req, res);
        await flushMicrotasks();

        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledWith('e1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });

    it('passes an undefined employee id through when params are missing', async () => {
        const req = { params: {} } as unknown as Request;
        getEmployeePackageDetailsByAdminServiceMock.mockResolvedValue({ success: true, employeePackageDetails: [] });

        await getEmployeePackagesByAdminController.getEmployeePackageDetailsByAdmin(req, res);
        await flushMicrotasks();

        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { employeeId: 'e1' } } as unknown as Request;
        getEmployeePackageDetailsByAdminServiceMock.mockRejectedValue({ success: false });

        await getEmployeePackagesByAdminController.getEmployeePackageDetailsByAdmin(req, res);
        await flushMicrotasks();

        expect(getEmployeePackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});