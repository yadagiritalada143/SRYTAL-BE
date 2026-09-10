import { Request, Response } from 'express';
import updateDepartmentByAdminController from '../../../controllers/admin/updateDepartmentByAdminController';
import updateDepartmentByAdminService from '../../../services/admin/updateDepartmentByAdminService';
import {
    DEPARTMENT_SUCCESS_MESSAGES,
    DEPARTMENT_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/departmentMessages';

jest.mock('../../../services/admin/updateDepartmentByAdminService', () => ({
    __esModule: true,
    default: {
        updateDepartmentByAdmin: jest.fn()
    }
}));

const updateDepartmentByAdminServiceMock = updateDepartmentByAdminService.updateDepartmentByAdmin as unknown as jest.Mock;

describe('updateDepartmentByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateDepartmentByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates a department successfully and returns 200 with the success message', async () => {
        const req = { body: { _id: 'dept123', departmentName: 'Engineering' } } as unknown as Request;
        updateDepartmentByAdminServiceMock.mockResolvedValue({ success: true });

        await updateDepartmentByAdminController.updateDepartmentByAdmin(req, res);

        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledWith('dept123', 'Engineering');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_UPDATE_SUCCESS_MESSAGE
        });
    });

    it('passes undefined values through when the body does not contain an id or name', async () => {
        const req = { body: {} } as unknown as Request;
        updateDepartmentByAdminServiceMock.mockResolvedValue({ success: true });

        await updateDepartmentByAdminController.updateDepartmentByAdmin(req, res);

        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledWith(undefined, undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { _id: 'dept123', departmentName: 'Engineering' } } as unknown as Request;
        updateDepartmentByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await updateDepartmentByAdminController.updateDepartmentByAdmin(req, res);

        expect(updateDepartmentByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_UPDATE_ERROR_MESSAGE
        });
    });
});