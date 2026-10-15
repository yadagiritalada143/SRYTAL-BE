import { Request, Response } from 'express';
import updatePackageByAdminController from '../../../controllers/admin/updatePackageByAdminController';
import updatePackageByAdminService from '../../../services/admin/updatePackageByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../../constants/admin/packageMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updatePackageByAdminService', () => ({
    __esModule: true,
    default: {
        updatePackageByAdmin: jest.fn()
    }
}));

const updatePackageByAdminServiceMock = updatePackageByAdminService.updatePackageByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updatePackageByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updatePackageByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'p1', detailsToUpdate: { name: 'Premium' } } } as unknown as Request;
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updatePackageByAdminServiceMock.mockResolvedValue(updateResponse);

        await updatePackageByAdminController.updatePackageByAdmin(req, res);
        await flushMicrotasks();

        expect(updatePackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updatePackageByAdminServiceMock).toHaveBeenCalledWith('p1', { name: 'Premium' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'p1', detailsToUpdate: { name: 'Premium' } } } as unknown as Request;
        updatePackageByAdminServiceMock.mockRejectedValue({ success: false });

        await updatePackageByAdminController.updatePackageByAdmin(req, res);
        await flushMicrotasks();

        expect(updatePackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_UPDATING_ERROR_MESSAGE
        });
    });
});