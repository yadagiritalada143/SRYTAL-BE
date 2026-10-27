import { Request, Response } from 'express';
import addEmploymentTypeByAdminController from '../../../controllers/admin/addEmploymentTypeByAdminController';
import addEmploymentTypeByAdminService from '../../../services/admin/addEmploymentTypeByAdminService';
import {
    EMPLOYMENT_TYPE_SUCCESS_MESSAGES,
    EMPLOYMENT_TYPE_ERRORS_MESSAGES
} from '../../../constants/admin/employementTypesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/addEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        addEmploymentTypeByAdmin: jest.fn()
    }
}));

const addEmploymentTypeByAdminServiceMock =
    addEmploymentTypeByAdminService.addEmploymentTypeByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addEmploymentTypeByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addEmploymentTypeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 201 with the success message when the employment type is saved with an id', async () => {
        const req = { body: { employmentType: 'Full-Time' } } as unknown as Request;
        addEmploymentTypeByAdminServiceMock.mockResolvedValue({ id: 'et123', employmentType: 'Full-Time' });

        await addEmploymentTypeByAdminController.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('Full-Time');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: EMPLOYMENT_TYPE_SUCCESS_MESSAGES.EMPLOYMENT_TYPE_ADD_SUCCESS_MESSAGE
        });
    });

    it('returns 400 with the error message when the saved employment type has no id', async () => {
        const req = { body: { employmentType: 'Full-Time' } } as unknown as Request;
        addEmploymentTypeByAdminServiceMock.mockResolvedValue({ success: false });

        await addEmploymentTypeByAdminController.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('Full-Time');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_ADD_ERROR_MESSAGE
        });
    });

    it('passes undefined through when the body does not contain an employment type', async () => {
        const req = { body: {} } as unknown as Request;
        addEmploymentTypeByAdminServiceMock.mockResolvedValue({ id: 'et123' });

        await addEmploymentTypeByAdminController.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    });

    it('returns 500 with the unexpected error message when the service throws', async () => {
        const req = { body: { employmentType: 'Full-Time' } } as unknown as Request;
        addEmploymentTypeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addEmploymentTypeByAdminController.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();

        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('Full-Time');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UNEXPECTED_ERROR_MESSAGE
        });
    });
});