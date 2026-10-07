"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyNavMenuController_1 = __importDefault(require("../../../controllers/common/getMyNavMenuController"));
const getMyNavMenuService_1 = __importDefault(require("../../../services/common/getMyNavMenuService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
const navMessages_1 = require("../../../constants/navigation/navMessages");
jest.mock('../../../services/common/getMyNavMenuService', () => ({
    __esModule: true,
    default: { getMyNavMenu: jest.fn() }
}));
const getMyNavMenuServiceMock = getMyNavMenuService_1.default.getMyNavMenu;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getMyNavMenuController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getMyNavMenuServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the menu result on success', async () => {
        const req = { user: { userId: 'u1', organizationId: 'org1' } };
        const menuResult = { success: true, surface: 'admin', menu: [], allowedUrls: [], managedUrls: [] };
        getMyNavMenuServiceMock.mockResolvedValue(menuResult);
        await getMyNavMenuController_1.default.getMyNavMenu(req, res);
        await flushMicrotasks();
        expect(getMyNavMenuServiceMock).toHaveBeenCalledWith('u1', 'org1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(menuResult);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'u1', organizationId: 'org1' } };
        getMyNavMenuServiceMock.mockRejectedValue(new Error('boom'));
        await getMyNavMenuController_1.default.getMyNavMenu(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: navMessages_1.NAV_ERROR_MESSAGES.MENU_FETCH_ERROR
        });
    });
    it('calls the service with undefined ids when the request has no user', async () => {
        const req = {};
        getMyNavMenuServiceMock.mockResolvedValue({ success: true, menu: [] });
        await getMyNavMenuController_1.default.getMyNavMenu(req, res);
        await flushMicrotasks();
        expect(getMyNavMenuServiceMock).toHaveBeenCalledWith(undefined, undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
});
