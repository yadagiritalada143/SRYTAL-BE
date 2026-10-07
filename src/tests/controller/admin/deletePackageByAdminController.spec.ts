import { Request, Response } from 'express';
import deletePackageByAdminController from '../../../controllers/admin/deletePackageByAdminController';
import deletePackageByAdminService from '../../../services/admin/deletePackageByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../../constants/admin/packageMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/deletePackageByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeletePackageServiceByAdmin: jest.fn(),
        softDeletePackageServiceByAdmin: jest.fn()
    }
}));

const hardDeletePackageServiceByAdminMock =
    deletePackageByAdminService.hardDeletePackageServiceByAdmin as unknown as jest.Mock;
const softDeletePackageServiceByAdminMock =
    deletePackageByAdminService.softDeletePackageServiceByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('deletePackageByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        hardDeletePackageServiceByAdminMock.mockReset();
        softDeletePackageServiceByAdminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('performs a hard delete and returns 200 when confirmDelete is true', async () => {
        const req = {
            params: { id: 'p1' },
            body: { confirmDelete: true }
        } as unknown as Request;
        hardDeletePackageServiceByAdminMock.mockResolvedValue({ success: true });

        await deletePackageByAdminController.deletePackageByAdmin(req, res);
        await flushMicrotasks();

        expect(hardDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(hardDeletePackageServiceByAdminMock).toHaveBeenCalledWith('p1');
        expect(softDeletePackageServiceByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 with the hard delete error when the hard delete fails', async () => {
        const req = {
            params: { id: 'p1' },
            body: { confirmDelete: true }
        } as unknown as Request;
        hardDeletePackageServiceByAdminMock.mockRejectedValue({ success: false });

        await deletePackageByAdminController.deletePackageByAdmin(req, res);
        await flushMicrotasks();

        expect(hardDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_HARD_DELETE_ERROR_MESSAGE
        });
    });

    it('performs a soft delete and returns 200 when confirmDelete is falsy', async () => {
        const req = {
            params: { id: 'p1' },
            body: { confirmDelete: false }
        } as unknown as Request;
        softDeletePackageServiceByAdminMock.mockResolvedValue({ success: true });

        await deletePackageByAdminController.deletePackageByAdmin(req, res);
        await flushMicrotasks();

        expect(softDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(softDeletePackageServiceByAdminMock).toHaveBeenCalledWith('p1');
        expect(hardDeletePackageServiceByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 with the soft delete error when the soft delete fails', async () => {
        const req = {
            params: { id: 'p1' },
            body: {}
        } as unknown as Request;
        softDeletePackageServiceByAdminMock.mockRejectedValue({ success: false });

        await deletePackageByAdminController.deletePackageByAdmin(req, res);
        await flushMicrotasks();

        expect(softDeletePackageServiceByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_SOFT_DELETE_ERROR_MESSAGE
        });
    });
});