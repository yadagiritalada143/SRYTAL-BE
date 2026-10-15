"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getOrganizationThemesService_1 = __importDefault(require("../../../services/common/getOrganizationThemesService"));
const organizationThemesModel_1 = __importDefault(require("../../../model/organizationThemesModel"));
jest.mock('../../../model/organizationThemesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
const findOneMock = organizationThemesModel_1.default.findOne;
describe('getOrganizationThemesService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the theme document for the organization', async () => {
        const themes = { _id: 't1', organization_name: 'Acme', primaryColor: '#000' };
        findOneMock.mockResolvedValue(themes);
        const result = await getOrganizationThemesService_1.default.getOrgThemes('Acme');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ organization_name: 'Acme' });
        expect(result).toEqual(themes);
    });
    it('returns the error when the lookup throws', async () => {
        const lookupError = new Error('DB down');
        findOneMock.mockRejectedValue(lookupError);
        const result = await getOrganizationThemesService_1.default.getOrgThemes('Acme');
        expect(result).toBe(lookupError);
    });
});
