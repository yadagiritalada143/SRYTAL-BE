import { Request, Response } from 'express';
import getAllEmployeeRoleByAdminController from '../../../controllers/admin/getAllEmployeeRoleByAdminController';
import getAllEmployeeRoleByAdminService from '../../../services/admin/getAllEmployeeRoleByAdminService';
import { EMPLOYEE_ROLE_ERRORS_MESSAGES } from '../../../constants/admin/employeeRolesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getAllEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        getAllEmployeeRolesByAdmin: jest.fn()
    }
}));

const getAllEmployeeRolesByAdminServiceMock =
    getAllEmployeeRoleByAdminService.getAllEmployeeRolesByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getAllEmployeeRolesByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllEmployeeRolesByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the fetched employee roles response when the service resolves', async () => {
        const req = {} as unknown as Request;
        const fetchResponse = { success: true, employeeRoles: [{ _id: 'role1', designation: 'Software Engineer' }] };
        getAllEmployeeRolesByAdminServiceMock.mockResolvedValue(fetchResponse);

        await getAllEmployeeRoleByAdminController.getAllEmployeeRolesByAdmin(req, res);
        await flushMicrotasks();

        expect(getAllEmployeeRolesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {} as unknown as Request;
        getAllEmployeeRolesByAdminServiceMock.mockRejectedValue({ success: false });

        await getAllEmployeeRoleByAdminController.getAllEmployeeRolesByAdmin(req, res);
        await flushMicrotasks();

        expect(getAllEmployeeRolesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_FETCH_ERROR_MESSAGES
        });
    });
});