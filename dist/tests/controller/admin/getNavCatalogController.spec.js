"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getNavCatalogController_1 = __importDefault(require("../../../controllers/admin/getNavCatalogController"));
const getNavCatalogService_1 = __importDefault(require("../../../services/admin/getNavCatalogService"));
const navMessages_1 = require("../../../constants/navigation/navMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getNavCatalogService', () => ({
    __esModule: true,
    default: {
        getNavCatalog: jest.fn()
    }
}));
const getNavCatalogServiceMock = getNavCatalogService_1.default.getNavCatalog;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getNavCatalog controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getNavCatalogServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the catalog when the service resolves', async () => {
        const req = { query: { surface: 'admin' } };
        const catalog = { success: true, catalog: [{ key: 'a-instance' }] };
        getNavCatalogServiceMock.mockResolvedValue(catalog);
        await getNavCatalogController_1.default.getNavCatalog(req, res);
        await flushMicrotasks();
        expect(getNavCatalogServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavCatalogServiceMock).toHaveBeenCalledWith('admin');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(catalog);
    });
    it('passes undefined when the surface query parameter is missing', async () => {
        const req = { query: {} };
        getNavCatalogServiceMock.mockResolvedValue({ success: true, catalog: [] });
        await getNavCatalogController_1.default.getNavCatalog(req, res);
        await flushMicrotasks();
        expect(getNavCatalogServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavCatalogServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { query: {} };
        getNavCatalogServiceMock.mockRejectedValue(new Error('Service failure'));
        await getNavCatalogController_1.default.getNavCatalog(req, res);
        await flushMicrotasks();
        expect(getNavCatalogServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: navMessages_1.NAV_ERROR_MESSAGES.CATALOG_FETCH_ERROR });
    });
});
