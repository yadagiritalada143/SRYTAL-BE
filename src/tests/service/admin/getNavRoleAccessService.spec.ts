import getNavRoleAccessService from '../../../services/admin/getNavRoleAccessService';
import NavItemModel from '../../../model/navItemModel';
import NavRoleAccessModel from '../../../model/navRoleAccessModel';
import { surfaceForRole } from '../../../services/navigation/navResolver';

jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/navRoleAccessModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

const navItemFindMock = (NavItemModel as unknown as { find: jest.Mock }).find;
const findOneMock = (NavRoleAccessModel as unknown as { findOne: jest.Mock }).findOne;

describe('getNavRoleAccessService', () => {
    beforeEach(() => {
        navItemFindMock.mockReset();
        findOneMock.mockReset();
    });

    it('returns the granted nav keys when an explicit access record exists', async () => {
        const role = 'Admin';
        const access = { _id: 'ra1', organization: 'org1', role, navKeys: ['k1', 'k2'] };
        findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(access) });

        const result = await getNavRoleAccessService.getNavRoleAccess('org1', role);

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ organization: 'org1', role });
        expect(navItemFindMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            role,
            surface: surfaceForRole(role),
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

        const result = await getNavRoleAccessService.getNavRoleAccess('org1', role);

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledWith({ surface: surfaceForRole(role) });
        expect(result).toEqual({
            success: true,
            role,
            surface: surfaceForRole(role),
            navKeys: ['dashboard', 'profile'],
            isDefault: true
        });
    });
});