import { Request, Response } from 'express';
import addDepartmentByAdminController from '../../../controllers/admin/addDepartmentByAdminController';
import addDepartmentByAdminService from '../../../services/admin/addDepartmentByAdminService';
import {
    DEPARTMENT_SUCCESS_MESSAGES,
    DEPARTMENT_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/departmentMessages';

jest.mock('../../../services/admin/addDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        addDepartmentByAdmin: jest.fn()
    }
}));

const addDepartmentByAdminServiceMock = addDepartmentByAdminService.addDepartmentByAdmin as unknown as jest.Mock;

describe('addDepartmentByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds a department successfully and returns 200 with the success message', async () => {
        const req = { body: { departmentName: 'Engineering' } } as unknown as Request;
        addDepartmentByAdminServiceMock.mockResolvedValue(undefined);

        await addDepartmentByAdminController.addDepartmentByAdmin(req, res);

        expect(addDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addDepartmentByAdminServiceMock).toHaveBeenCalledWith('Engineering');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_ADD_SUCCESS_MESSAGE
        });
    });

    it('passes an empty department name through to the service when the body does not contain one', async () => {
        const req = { body: {} } as unknown as Request;
        addDepartmentByAdminServiceMock.mockResolvedValue(undefined);

        await addDepartmentByAdminController.addDepartmentByAdmin(req, res);

        expect(addDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addDepartmentByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { departmentName: 'Engineering' } } as unknown as Request;
        addDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addDepartmentByAdminController.addDepartmentByAdmin(req, res);

        expect(addDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addDepartmentByAdminServiceMock).toHaveBeenCalledWith('Engineering');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_ADD_ERROR_MESSAGE
        });
    });
});