import { Request, Response } from 'express';
import getOrganizationThemesController from '../../../controllers/common/getOrganizationThemesController';
import getOrganizationThemesService from '../../../services/common/getOrganizationThemesService';
import { ORGANIZATION_THEMES_ERROR_MESSAGES } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/getOrganizationThemesService', () => ({
    __esModule: true,
    default: { getOrgThemes: jest.fn() }
}));

const getOrgThemesMock = getOrganizationThemesService.getOrgThemes as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getOrganizationThemesController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getOrgThemesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the themes on success', async () => {
        const req = { params: { organization_name: 'Acme' } } as unknown as Request;
        const themes = { _id: 't1', primaryColor: '#000' };
        getOrgThemesMock.mockResolvedValue(themes);

        await getOrganizationThemesController.getOrganizationThemes(req, res);
        await flushMicrotasks();

        expect(getOrgThemesMock).toHaveBeenCalledWith('Acme');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, themesResponse: themes });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { organization_name: 'Acme' } } as unknown as Request;
        getOrgThemesMock.mockRejectedValue(new Error('boom'));

        await getOrganizationThemesController.getOrganizationThemes(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: ORGANIZATION_THEMES_ERROR_MESSAGES.THEMES_FETCHING_ERROR
        });
    });
});