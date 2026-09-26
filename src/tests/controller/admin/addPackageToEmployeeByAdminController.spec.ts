import { Request, Response } from 'express';
import addPackageToEmployeeByAdminController from '../../../controllers/admin/addPackageToEmployeeByAdminController';
import addPackageToEmployeeByAdminService from '../../../services/admin/addPackageToEmployeeByAdminService';
import { PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE } from '../../../constants/admin/packageToEmployeeMessage';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/addPackageToEmployeeByAdminService', () => ({
    __esModule: true,
    default: {
        addPackagetoEmployeeByAdmin: jest.fn()
    }
}));

const addPackagetoEmployeeByAdminServiceMock =
    addPackageToEmployeeByAdminService.addPackagetoEmployeeByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addPackageToEmployeeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addPackagetoEmployeeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the success response when the package is assigned to the employee', async () => {
        const req = { body: { employeeId: 'e1', packageId: 'p1' } } as unknown as Request;
        addPackagetoEmployeeByAdminServiceMock.mockResolvedValue({ _id: 'ep1' });

        await addPackageToEmployeeByAdminController.addPackageToEmployeeByAdmin(req, res);
        await flushMicrotasks();

        expect(addPackagetoEmployeeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addPackagetoEmployeeByAdminServiceMock).toHaveBeenCalledWith({ employeeId: 'e1', packageId: 'p1' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ succes: true });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { employeeId: 'e1', packageId: 'p1' } } as unknown as Request;
        addPackagetoEmployeeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addPackageToEmployeeByAdminController.addPackageToEmployeeByAdmin(req, res);
        await flushMicrotasks();

        expect(addPackagetoEmployeeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE.ADD_PACKAGE_TO_EMPLOYEE_ERROR_MESSAGE
        });
    });
});