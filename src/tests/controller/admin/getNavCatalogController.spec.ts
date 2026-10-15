import { Request, Response } from 'express';
import getNavCatalogController from '../../../controllers/admin/getNavCatalogController';
import getNavCatalogService from '../../../services/admin/getNavCatalogService';
import { NAV_ERROR_MESSAGES } from '../../../constants/navigation/navMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getNavCatalogService', () => ({
    __esModule: true,
    default: {
        getNavCatalog: jest.fn()
    }
}));

const getNavCatalogServiceMock = getNavCatalogService.getNavCatalog as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getNavCatalog controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getNavCatalogServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the catalog when the service resolves', async () => {
        const req = { query: { surface: 'admin' } } as unknown as Request;
        const catalog = { success: true, catalog: [{ key: 'a-instance' }] };
        getNavCatalogServiceMock.mockResolvedValue(catalog);

        await getNavCatalogController.getNavCatalog(req, res);
        await flushMicrotasks();

        expect(getNavCatalogServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavCatalogServiceMock).toHaveBeenCalledWith('admin');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(catalog);
    });

    it('passes undefined when the surface query parameter is missing', async () => {
        const req = { query: {} } as unknown as Request;
        getNavCatalogServiceMock.mockResolvedValue({ success: true, catalog: [] });

        await getNavCatalogController.getNavCatalog(req, res);
        await flushMicrotasks();

        expect(getNavCatalogServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavCatalogServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { query: {} } as unknown as Request;
        getNavCatalogServiceMock.mockRejectedValue(new Error('Service failure'));

        await getNavCatalogController.getNavCatalog(req, res);
        await flushMicrotasks();

        expect(getNavCatalogServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: NAV_ERROR_MESSAGES.CATALOG_FETCH_ERROR });
    });
});