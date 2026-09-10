import { Request, Response } from 'express';
import getDepartmentByAdminController from '../../../controllers/admin/getDepartmentByAdminController';
import getDepartmentByAdminService from '../../../services/admin/getDepartmentByAdminService';
import {
    DEPARTMENT_SUCCESS_MESSAGES,
    DEPARTMENT_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/departmentMessages';

jest.mock('../../../services/admin/getDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        getDepartmentByAdmin: jest.fn()
    }
}));

const getDepartmentByAdminServiceMock = getDepartmentByAdminService.getDepartmentByAdmin as unknown as jest.Mock;

describe('getDepartmentByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the department details with 200 when the department exists', async () => {
        const req = { params: { _id: 'dept123' } } as unknown as Request;
        const department = { _id: 'dept123', departmentName: 'Engineering' };
        getDepartmentByAdminServiceMock.mockResolvedValue(department);

        await getDepartmentByAdminController.getDepartmentByAdmin(req, res);

        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: DEPARTMENT_SUCCESS_MESSAGES.FETCH_DEPARTMENT_SUCCESS_MESSAGE,
            data: department
        });
    });

    it('returns 404 with the not-found message when the department does not exist', async () => {
        const req = { params: { _id: 'unknown' } } as unknown as Request;
        getDepartmentByAdminServiceMock.mockResolvedValue(null);

        await getDepartmentByAdminController.getDepartmentByAdmin(req, res);

        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledWith('unknown');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_NOT_FOUND_ERROR_MESSAGE
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { _id: 'dept123' } } as unknown as Request;
        getDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await getDepartmentByAdminController.getDepartmentByAdmin(req, res);

        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DEPARTMENT_ERROR_MESSAGES.FETCH_DEPARTMENT_ERROR_MESSAGE
        });
    });
});