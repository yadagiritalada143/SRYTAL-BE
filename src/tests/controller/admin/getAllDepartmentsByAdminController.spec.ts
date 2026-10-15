import { Request, Response } from 'express';
import getAllDepartmentsByAdminController from '../../../controllers/admin/getAllDepartmentsByAdminController';
import getAllDepartmentByAdminService from '../../../services/admin/getAllDepartmentByAdminService';
import {
    DEPARTMENT_SUCCESS_MESSAGES,
    DEPARTMENT_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/departmentMessages';

jest.mock('../../../services/admin/getAllDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        getAllDepartmentsByAdmin: jest.fn()
    }
}));

const getAllDepartmentsByAdminServiceMock =
    getAllDepartmentByAdminService.getAllDepartmentsByAdmin as unknown as jest.Mock;

describe('getAllDepartmentsByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllDepartmentsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the departments when the service resolves', async () => {
        const req = {} as unknown as Request;
        const departments = [{ _id: 'd1', department: 'Engineering' }];
        getAllDepartmentsByAdminServiceMock.mockResolvedValue(departments);

        await getAllDepartmentsByAdminController.getAllDepartmentsByAdmin(req, res);

        expect(getAllDepartmentsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: DEPARTMENT_SUCCESS_MESSAGES.FETCH_ALL_DEPARTMENTS_SUCCESS_MESSAGE,
            data: departments
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {} as unknown as Request;
        getAllDepartmentsByAdminServiceMock.mockRejectedValue({ success: false });

        await getAllDepartmentsByAdminController.getAllDepartmentsByAdmin(req, res);

        expect(getAllDepartmentsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DEPARTMENT_ERROR_MESSAGES.FETCH_ALL_DEPARTMENTS_ERROR_MESSAGE
        });
    });
});