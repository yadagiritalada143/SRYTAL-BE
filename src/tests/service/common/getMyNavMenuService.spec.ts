import getMyNavMenuService from '../../../services/common/getMyNavMenuService';
import UserModel from '../../../model/userModel';
import NavItemModel from '../../../model/navItemModel';
import {
    surfaceForRole,
    resolveEffectiveKeys,
    buildMenuTree,
    collectUrls
} from '../../../services/navigation/navResolver';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../services/navigation/navResolver', () => ({
    surfaceForRole: jest.fn(),
    resolveEffectiveKeys: jest.fn(),
    buildMenuTree: jest.fn(),
    collectUrls: jest.fn()
}));

const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;
const navItemFindMock = (NavItemModel as unknown as { find: jest.Mock }).find;
const surfaceForRoleMock = surfaceForRole as unknown as jest.Mock;
const resolveEffectiveKeysMock = resolveEffectiveKeys as unknown as jest.Mock;
const buildMenuTreeMock = buildMenuTree as unknown as jest.Mock;
const collectUrlsMock = collectUrls as unknown as jest.Mock;

describe('getMyNavMenuService', () => {
    beforeEach(() => {
        userFindByIdMock.mockReset();
        navItemFindMock.mockReset();
        surfaceForRoleMock.mockReset();
        resolveEffectiveKeysMock.mockReset();
        buildMenuTreeMock.mockReset();
        collectUrlsMock.mockReset();
    });

    it('returns success false when the user does not exist', async () => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
        });

        const result = await getMyNavMenuService.getMyNavMenu('u1', 'org1');

        expect(userFindByIdMock).toHaveBeenCalledWith('u1');
        expect(navItemFindMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: 'User not found' });
    });

    it('builds the menu from the effective keys and catalog items', async () => {
        const user = { userRole: 'admin', organization: 'org1' };
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) })
        });
        surfaceForRoleMock.mockReturnValue('admin');
        resolveEffectiveKeysMock.mockResolvedValue(new Set(['key1', 'key2']));
        navItemFindMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
                { key: 'key1', url: '/a', order: 1 },
                { key: 'key2', url: '/b', order: 2 },
                { key: 'key3', url: '/c', order: 3 }
            ])
        });
        buildMenuTreeMock.mockReturnValue([{ key: 'key1', url: '/a' }]);
        collectUrlsMock.mockReturnValue(['/a']);

        const result = await getMyNavMenuService.getMyNavMenu('u1', 'org1');

        expect(surfaceForRoleMock).toHaveBeenCalledWith('admin');
        expect(resolveEffectiveKeysMock).toHaveBeenCalledWith('org1', 'admin', 'u1', 'admin');
        expect(navItemFindMock).toHaveBeenCalledWith({ surface: 'admin' });
        expect(buildMenuTreeMock).toHaveBeenCalledTimes(1);
        expect(collectUrlsMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            success: true,
            surface: 'admin',
            menu: [{ key: 'key1', url: '/a' }],
            allowedUrls: ['/a'],
            managedUrls: ['/a', '/b', '/c']
        });
    });

    it('falls back to the user organization when no organizationId is passed', async () => {
        const user = { userRole: 'employee', organization: 'org9' };
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) })
        });
        surfaceForRoleMock.mockReturnValue('Employee');
        resolveEffectiveKeysMock.mockResolvedValue(new Set<string>());
        navItemFindMock.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        buildMenuTreeMock.mockReturnValue([]);
        collectUrlsMock.mockReturnValue([]);

        await getMyNavMenuService.getMyNavMenu('u1', '');

        expect(resolveEffectiveKeysMock).toHaveBeenCalledWith('org9', 'employee', 'u1', 'Employee');
    });

    it('uses empty role and organization strings when both are absent', async () => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({}) })
        });
        surfaceForRoleMock.mockReturnValue('');
        resolveEffectiveKeysMock.mockResolvedValue(new Set<string>());
        navItemFindMock.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        buildMenuTreeMock.mockReturnValue([]);
        collectUrlsMock.mockReturnValue([]);

        await getMyNavMenuService.getMyNavMenu('u1', '');

        expect(resolveEffectiveKeysMock).toHaveBeenCalledWith('', '', 'u1', '');
    });

    it('filters out catalog items without a url from the managed url list', async () => {
        const user = { userRole: 'admin', organization: 'org1' };
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) })
        });
        surfaceForRoleMock.mockReturnValue('admin');
        resolveEffectiveKeysMock.mockResolvedValue(new Set(['key1']));
        navItemFindMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue([{ key: 'key1', url: '/a' }, { key: 'key2' }])
        });
        buildMenuTreeMock.mockReturnValue([]);
        collectUrlsMock.mockReturnValue([]);

        const result = await getMyNavMenuService.getMyNavMenu('u1', 'org1');

        expect(result.managedUrls).toEqual(['/a']);
    });
});