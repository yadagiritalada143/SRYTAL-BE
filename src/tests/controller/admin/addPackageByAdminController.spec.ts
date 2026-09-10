import { Request, Response } from 'express';
import addPackageByAdminController from '../../../controllers/admin/addPackageByAdminController';
import addPackageByAdminService from '../../../services/admin/addPackageByAdminService';
import {
    PACKAGE_SUCCESS_MESSAGES,
    PACKAGE_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/admin/packageMessages';

jest.mock('../../../services/admin/addPackageByAdminService', () => ({
    __esModule: true,
    default: {
        addPackageByAdmin: jest.fn()
    }
}));

const addPackageByAdminServiceMock = addPackageByAdminService.addPackageByAdmin as unknown as jest.Mock;

describe('addPackageByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addPackageByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('adds a package successfully, flags it as not deleted, and returns 200 with the success message', async () => {
        const req = { body: { name: 'Premium', amount: 1000 } } as unknown as Request;
        addPackageByAdminServiceMock.mockResolvedValue(undefined);

        await addPackageByAdminController.addPackageByAdmin(req, res);

        expect(req.body).toEqual({ name: 'Premium', amount: 1000, isDeleted: false });
        expect(addPackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addPackageByAdminServiceMock).toHaveBeenCalledWith({ name: 'Premium', amount: 1000, isDeleted: false });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: PACKAGE_SUCCESS_MESSAGES.PACKAGE_ADD_SUCCESS_MESSAGE
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { name: 'Premium' } } as unknown as Request;
        addPackageByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addPackageByAdminController.addPackageByAdmin(req, res);

        expect(addPackageByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_ADD_ERROR_MESSAGE
        });
    });
});