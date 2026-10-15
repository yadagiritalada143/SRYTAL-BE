"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getOrganizationThemesController_1 = __importDefault(require("../../../controllers/common/getOrganizationThemesController"));
const getOrganizationThemesService_1 = __importDefault(require("../../../services/common/getOrganizationThemesService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/common/getOrganizationThemesService', () => ({
    __esModule: true,
    default: { getOrgThemes: jest.fn() }
}));
const getOrgThemesMock = getOrganizationThemesService_1.default.getOrgThemes;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getOrganizationThemesController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getOrgThemesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the themes on success', async () => {
        const req = { params: { organization_name: 'Acme' } };
        const themes = { _id: 't1', primaryColor: '#000' };
        getOrgThemesMock.mockResolvedValue(themes);
        await getOrganizationThemesController_1.default.getOrganizationThemes(req, res);
        await flushMicrotasks();
        expect(getOrgThemesMock).toHaveBeenCalledWith('Acme');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, themesResponse: themes });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { organization_name: 'Acme' } };
        getOrgThemesMock.mockRejectedValue(new Error('boom'));
        await getOrganizationThemesController_1.default.getOrganizationThemes(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.ORGANIZATION_THEMES_ERROR_MESSAGES.THEMES_FETCHING_ERROR
        });
    });
});
