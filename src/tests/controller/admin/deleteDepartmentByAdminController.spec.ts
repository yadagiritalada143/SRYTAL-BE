import { Request, Response } from 'express';
import deleteDepartmentByAdminController from '../../../controllers/admin/deleteDepartmentByAdminController';
import deleteDepartmentByAdminService from '../../../services/admin/deleteDepartmentByAdminService';
import {
    DEPARTMENT_SUCCESS_MESSAGES,
    DEPARTMENT_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/departmentMessages';

jest.mock('../../../services/admin/deleteDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        deleteDepartmentByAdmin: jest.fn()
    }
}));

const deleteDepartmentByAdminServiceMock = deleteDepartmentByAdminService.deleteDepartmentByAdmin as unknown as jest.Mock;

describe('deleteDepartmentByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('deletes a department successfully and returns 200 with the success message', async () => {
        const req = { params: { _id: 'dept123' } } as unknown as Request;
        deleteDepartmentByAdminServiceMock.mockResolvedValue({ success: true });

        await deleteDepartmentByAdminController.deleteDepartmentByAdmin(req, res);

        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_DELETE_SUCCESS_MESSAGE
        });
    });

    it('passes an undefined id through when the params do not contain an id', async () => {
        const req = { params: {} } as unknown as Request;
        deleteDepartmentByAdminServiceMock.mockResolvedValue({ success: true });

        await deleteDepartmentByAdminController.deleteDepartmentByAdmin(req, res);

        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { _id: 'dept123' } } as unknown as Request;
        deleteDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await deleteDepartmentByAdminController.deleteDepartmentByAdmin(req, res);

        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_DELETE_ERROR_MESSAGE
        });
    });
});