import getOrganizationThemesService from '../../../services/common/getOrganizationThemesService';
import OrganizationThemesModel from '../../../model/organizationThemesModel';

jest.mock('../../../model/organizationThemesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

const findOneMock = (OrganizationThemesModel as unknown as { findOne: jest.Mock }).findOne;

describe('getOrganizationThemesService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the theme document for the organization', async () => {
        const themes = { _id: 't1', organization_name: 'Acme', primaryColor: '#000' };
        findOneMock.mockResolvedValue(themes);

        const result = await getOrganizationThemesService.getOrgThemes('Acme');

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ organization_name: 'Acme' });
        expect(result).toEqual(themes);
    });

    it('returns the error when the lookup throws', async () => {
        const lookupError = new Error('DB down');
        findOneMock.mockRejectedValue(lookupError);

        const result = await getOrganizationThemesService.getOrgThemes('Acme');

        expect(result).toBe(lookupError);
    });
});