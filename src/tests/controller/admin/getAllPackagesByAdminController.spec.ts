import { Request, Response } from 'express';
import getAllPackagesByAdminController from '../../../controllers/admin/getAllPackagesByAdminController';
import getAllPackagesByAdminService from '../../../services/admin/getAllPackagesByAdminService';
import { PACKAGE_ERROR_MESSAGES, HTTP_STATUS } from '../../../constants/admin/packageMessages';

jest.mock('../../../services/admin/getAllPackagesByAdminService', () => ({
    __esModule: true,
    default: {
        getAllPackagesWithTasksByAdmin: jest.fn()
    }
}));

const getAllPackagesWithTasksByAdminServiceMock =
    getAllPackagesByAdminService.getAllPackagesWithTasksByAdmin as unknown as jest.Mock;

describe('getAllPackagesDetails controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllPackagesWithTasksByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the fetched packages response when the service resolves', async () => {
        const req = {} as unknown as Request;
        const fetchResponse = { success: true, packagesList: [{ _id: 'p1', name: 'Premium', tasks: [] }] };
        getAllPackagesWithTasksByAdminServiceMock.mockResolvedValue(fetchResponse);

        await getAllPackagesByAdminController.getAllPackagesDetails(req, res);

        expect(getAllPackagesWithTasksByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {} as unknown as Request;
        getAllPackagesWithTasksByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await getAllPackagesByAdminController.getAllPackagesDetails(req, res);

        expect(getAllPackagesWithTasksByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE
        });
    });
});