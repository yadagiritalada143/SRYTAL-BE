import { Request, Response } from 'express';
import addEmployeeRoleByAdminController from '../../../controllers/admin/addEmployeeRoleByAdminController';
import addEmployeeRoleByAdminService from '../../../services/admin/addEmployeeRoleByAdminService';
import {
    EMPLOYEE_ROLE_SUCCESS_MESSAGES,
    EMPLOYEE_ROLE_ERRORS_MESSAGES
} from '../../../constants/admin/employeeRolesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/addEmployeeRoleByAdminService', () => ({
    __esModule: true,
    default: {
        addEmployeeRoleByAdmin: jest.fn()
    }
}));

const addEmployeeRoleByAdminServiceMock = addEmployeeRoleByAdminService.addEmployeeRoleByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addEmployeeRoleByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addEmployeeRoleByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 201 with the success message when the employee role is saved with an id', async () => {
        const req = { body: { designation: 'Software Engineer' } } as unknown as Request;
        addEmployeeRoleByAdminServiceMock.mockResolvedValue({ id: 'role123', designation: 'Software Engineer' });

        await addEmployeeRoleByAdminController.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('Software Engineer');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: EMPLOYEE_ROLE_SUCCESS_MESSAGES.EMPLOYEE_ROLE_ADD_SUCCESS_MESSAGE
        });
    });

    it('returns 400 with the error message when the saved employee role has no id', async () => {
        const req = { body: { designation: 'Software Engineer' } } as unknown as Request;
        addEmployeeRoleByAdminServiceMock.mockResolvedValue({ success: false });

        await addEmployeeRoleByAdminController.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('Software Engineer');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_ADD_ERROR_MESSAGE
        });
    });

    it('passes undefined through when the body does not contain a designation', async () => {
        const req = { body: {} } as unknown as Request;
        addEmployeeRoleByAdminServiceMock.mockResolvedValue({ id: 'role123' });

        await addEmployeeRoleByAdminController.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    });

    it('sends no response and logs the error when the service throws', async () => {
        const req = { body: { designation: 'Software Engineer' } } as unknown as Request;
        addEmployeeRoleByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await addEmployeeRoleByAdminController.addEmployeeRoleByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmployeeRoleByAdminServiceMock).toHaveBeenCalledWith('Software Engineer');
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
        expect(mockJson).not.toHaveBeenCalled();
    });
});