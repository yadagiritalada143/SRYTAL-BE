import { Request, Response } from 'express';
import getMyNavMenuController from '../../../controllers/common/getMyNavMenuController';
import getMyNavMenuService from '../../../services/common/getMyNavMenuService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { NAV_ERROR_MESSAGES } from '../../../constants/navigation/navMessages';

jest.mock('../../../services/common/getMyNavMenuService', () => ({
    __esModule: true,
    default: { getMyNavMenu: jest.fn() }
}));

const getMyNavMenuServiceMock = getMyNavMenuService.getMyNavMenu as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getMyNavMenuController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getMyNavMenuServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the menu result on success', async () => {
        const req = { user: { userId: 'u1', organizationId: 'org1' } } as unknown as Request;
        const menuResult = { success: true, surface: 'admin', menu: [], allowedUrls: [], managedUrls: [] };
        getMyNavMenuServiceMock.mockResolvedValue(menuResult);

        await getMyNavMenuController.getMyNavMenu(req, res);
        await flushMicrotasks();

        expect(getMyNavMenuServiceMock).toHaveBeenCalledWith('u1', 'org1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(menuResult);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'u1', organizationId: 'org1' } } as unknown as Request;
        getMyNavMenuServiceMock.mockRejectedValue(new Error('boom'));

        await getMyNavMenuController.getMyNavMenu(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: NAV_ERROR_MESSAGES.MENU_FETCH_ERROR
        });
    });

    it('calls the service with undefined ids when the request has no user', async () => {
        const req = {} as unknown as Request;
        getMyNavMenuServiceMock.mockResolvedValue({ success: true, menu: [] });

        await getMyNavMenuController.getMyNavMenu(req, res);
        await flushMicrotasks();

        expect(getMyNavMenuServiceMock).toHaveBeenCalledWith(undefined, undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
});