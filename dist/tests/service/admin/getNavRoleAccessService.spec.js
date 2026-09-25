"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getNavRoleAccessService_1 = __importDefault(require("../../../services/admin/getNavRoleAccessService"));
const navItemModel_1 = __importDefault(require("../../../model/navItemModel"));
const navRoleAccessModel_1 = __importDefault(require("../../../model/navRoleAccessModel"));
const navResolver_1 = require("../../../services/navigation/navResolver");
jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
jest.mock('../../../model/navRoleAccessModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
const navItemFindMock = navItemModel_1.default.find;
const findOneMock = navRoleAccessModel_1.default.findOne;
describe('getNavRoleAccessService', () => {
    beforeEach(() => {
        navItemFindMock.mockReset();
        findOneMock.mockReset();
    });
    it('returns the granted nav keys when an explicit access record exists', async () => {
        const role = 'Admin';
        const access = { _id: 'ra1', organization: 'org1', role, navKeys: ['k1', 'k2'] };
        findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(access) });
        const result = await getNavRoleAccessService_1.default.getNavRoleAccess('org1', role);
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ organization: 'org1', role });
        expect(navItemFindMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            role,
            surface: (0, navResolver_1.surfaceForRole)(role),
            navKeys: ['k1', 'k2'],
            isDefault: false
        });
    });
    it('falls back to the full surface catalog when no access record exists', async () => {
        const role = 'Employee';
        const catalog = [{ key: 'dashboard' }, { key: 'profile' }];
        findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(catalog) })
        });
        const result = await getNavRoleAccessService_1.default.getNavRoleAccess('org1', role);
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledWith({ surface: (0, navResolver_1.surfaceForRole)(role) });
        expect(result).toEqual({
            success: true,
            role,
            surface: (0, navResolver_1.surfaceForRole)(role),
            navKeys: ['dashboard', 'profile'],
            isDefault: true
        });
    });
});
