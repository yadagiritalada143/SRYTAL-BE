import { Request, Response } from 'express';
import deleteEmployeeRoleByAdminController from '../../../controllers/admin/deleteEmployeeRoleByAdminController';
import deleteEmployeeRoleByAdminService from '../../../services/admin/deleteEmployeeRoleByAdminService';
import { EMPLOYEE_ROLE_ERRORS_MESSAGES } from '../../../constants/admin/employeeRolesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/deleteEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmployeeRoleByAdmin: jest.fn()
    }
}));

const deleteEmployeeRoleByAdminServiceMock =
    deleteEmployeeRoleByAdminService.deleteEmployeeRoleByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteEmployeeRole controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteEmployeeRoleByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the delete response when the service resolves', async () => {
        const req = { params: { id: 'r1' } } as unknown as Request;
        const deleteResponse = { success: true, responseAfterDelete: { _id: 'r1' } };
        deleteEmployeeRoleByAdminServiceMock.mockResolvedValue(deleteResponse);

        await deleteEmployeeRoleByAdminController.deleteEmployeeRole(req, res);
        await flushMicrotasks();

        expect(deleteEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('r1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(deleteResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { id: 'r1' } } as unknown as Request;
        deleteEmployeeRoleByAdminServiceMock.mockRejectedValue({ success: false });

        await deleteEmployeeRoleByAdminController.deleteEmployeeRole(req, res);
        await flushMicrotasks();

        expect(deleteEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_DELETE_ERROR_MESSAGE
        });
    });
});