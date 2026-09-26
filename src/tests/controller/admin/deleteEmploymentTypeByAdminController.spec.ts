import { Request, Response } from 'express';
import deleteEmploymentTypeByAdminController from '../../../controllers/admin/deleteEmploymentTypeByAdminController';
import deleteEmploymentTypeByAdminService from '../../../services/admin/deleteEmploymentTypeByAdminService';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES } from '../../../constants/admin/employementTypesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/deleteEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        deleteEmploymentTypeByAdmin: jest.fn()
    }
}));

const deleteEmploymentTypeByAdminServiceMock =
    deleteEmploymentTypeByAdminService.deleteEmploymentTypeByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteEmploymentType controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteEmploymentTypeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the delete response when the service resolves', async () => {
        const req = { params: { id: 'et1' } } as unknown as Request;
        const deleteResponse = { success: true, responseAfterDelete: { _id: 'et1' } };
        deleteEmploymentTypeByAdminServiceMock.mockResolvedValue(deleteResponse);

        await deleteEmploymentTypeByAdminController.deleteEmploymentType(req, res);
        await flushMicrotasks();

        expect(deleteEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('et1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(deleteResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { id: 'et1' } } as unknown as Request;
        deleteEmploymentTypeByAdminServiceMock.mockRejectedValue({ success: false });

        await deleteEmploymentTypeByAdminController.deleteEmploymentType(req, res);
        await flushMicrotasks();

        expect(deleteEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_DELETE_ERROR_MESSAGE
        });
    });
});