import { Request, Response } from 'express';
import updateEmployeeRoleByAdminController from '../../../controllers/admin/updateEmployeeRoleByAdminController';
import updateEmployeeRoleByAdminService from '../../../services/admin/updateEmployeeRoleByAdminService';
import { EMPLOYEE_ROLE_ERRORS_MESSAGES } from '../../../constants/admin/employeeRolesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        updateEmployeeRoleByAdmin: jest.fn()
    }
}));

const updateEmployeeRoleByAdminServiceMock =
    updateEmployeeRoleByAdminService.updateEmployeeRoleByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateEmployeeRole controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateEmployeeRoleByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'r1', designation: 'Manager' } } as unknown as Request;
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateEmployeeRoleByAdminServiceMock.mockResolvedValue(updateResponse);

        await updateEmployeeRoleByAdminController.updateEmployeeRole(req, res);
        await flushMicrotasks();

        expect(updateEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('r1', 'Manager');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'r1', designation: 'Manager' } } as unknown as Request;
        updateEmployeeRoleByAdminServiceMock.mockRejectedValue({ success: false });

        await updateEmployeeRoleByAdminController.updateEmployeeRole(req, res);
        await flushMicrotasks();

        expect(updateEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_UPDATING_ERROR_MESSAGE
        });
    });
});