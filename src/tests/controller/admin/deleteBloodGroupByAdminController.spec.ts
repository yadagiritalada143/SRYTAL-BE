import { Request, Response } from 'express';
import deleteBloodGroupByAdminController from '../../../controllers/admin/deleteBloodGroupByAdminController';
import deleteBloodGroupByAdminService from '../../../services/admin/deleteBloodGroupByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../../constants/admin/manageUserMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/deleteBloodGroupByAdminService', () => ({
    __esModule: true,
    default: {
        deleteBloodGroupByAdmin: jest.fn()
    }
}));

const deleteBloodGroupByAdminServiceMock = deleteBloodGroupByAdminService.deleteBloodGroupByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deleteBloodGroup controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteBloodGroupByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the delete response when the service resolves', async () => {
        const req = { params: { id: 'bg1' } } as unknown as Request;
        const deleteResponse = { success: true, responseAfterDelete: { _id: 'bg1' } };
        deleteBloodGroupByAdminServiceMock.mockResolvedValue(deleteResponse);

        await deleteBloodGroupByAdminController.deleteBloodGroup(req, res);
        await flushMicrotasks();

        expect(deleteBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteBloodGroupByAdminServiceMock).toHaveBeenCalledWith('bg1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(deleteResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { params: { id: 'bg1' } } as unknown as Request;
        deleteBloodGroupByAdminServiceMock.mockRejectedValue({ success: false });

        await deleteBloodGroupByAdminController.deleteBloodGroup(req, res);
        await flushMicrotasks();

        expect(deleteBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE
        });
    });
});