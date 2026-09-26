import { Request, Response } from 'express';
import getPackageDetailsByAdminController from '../../../controllers/admin/getPackageDetailsByAdminController';
import getPackageDetailsByAdminService from '../../../services/admin/getPackageDetailsByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../../constants/admin/packageMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getPackageDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        getPackageDetailsByAdmin: jest.fn()
    }
}));

const getPackageDetailsByAdminServiceMock =
    getPackageDetailsByAdminService.getPackageDetailsByAdmin as unknown as jest.Mock;

describe('getPackageDetailsByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getPackageDetailsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the package details when the service resolves', async () => {
        const req = { params: { id: 'p1' } } as unknown as Request;
        const fetchResponse = { success: true, packageDetails: { _id: 'p1', name: 'Premium' } };
        getPackageDetailsByAdminServiceMock.mockResolvedValue(fetchResponse);

        await getPackageDetailsByAdminController.getPackageDetailsByAdmin(req, res);

        expect(getPackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(getPackageDetailsByAdminServiceMock).toHaveBeenCalledWith('p1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { id: 'p1' } } as unknown as Request;
        getPackageDetailsByAdminServiceMock.mockRejectedValue({ success: false });

        await getPackageDetailsByAdminController.getPackageDetailsByAdmin(req, res);

        expect(getPackageDetailsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});