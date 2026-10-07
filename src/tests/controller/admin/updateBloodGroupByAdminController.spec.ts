import { Request, Response } from 'express';
import updateBloodGroupByAdminController from '../../../controllers/admin/updateBloodGroupByAdminController';
import updateBloodGroupByAdminService from '../../../services/admin/updateBloodGroupByAdminService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateBloodGroupByAdminService', () => ({
    __esModule: true,
    default: {
        updateBloodGroupByAdmin: jest.fn()
    }
}));

const updateBloodGroupByAdminServiceMock = updateBloodGroupByAdminService.updateBloodGroupByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateBloodGroup controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateBloodGroupByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'bg1', type: 'AB+' } } as unknown as Request;
        const updateResponse = { success: true, responseAfterupdate: { modifiedCount: 1 } };
        updateBloodGroupByAdminServiceMock.mockResolvedValue(updateResponse);

        await updateBloodGroupByAdminController.updateBloodGroup(req, res);
        await flushMicrotasks();

        expect(updateBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateBloodGroupByAdminServiceMock).toHaveBeenCalledWith('bg1', 'AB+');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'bg1', type: 'AB+' } } as unknown as Request;
        updateBloodGroupByAdminServiceMock.mockRejectedValue({ success: false });

        await updateBloodGroupByAdminController.updateBloodGroup(req, res);
        await flushMicrotasks();

        expect(updateBloodGroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_BLOOD_GROUP_DETAILS
        });
    });
});