import getNavUserAccessService from '../../../services/admin/getNavUserAccessService';
import UserModel from '../../../model/userModel';
import NavItemModel from '../../../model/navItemModel';
import NavRoleAccessModel from '../../../model/navRoleAccessModel';
import NavUserAccessModel from '../../../model/navUserAccessModel';
import { surfaceForRole } from '../../../services/navigation/navResolver';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/navRoleAccessModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../model/navUserAccessModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;
const navItemFindMock = (NavItemModel as unknown as { find: jest.Mock }).find;
const roleAccessFindOneMock = (NavRoleAccessModel as unknown as { findOne: jest.Mock }).findOne;
const userAccessFindOneMock = (NavUserAccessModel as unknown as { findOne: jest.Mock }).findOne;

describe('getNavUserAccessService', () => {
    beforeEach(() => {
        userFindByIdMock.mockReset();
        navItemFindMock.mockReset();
        roleAccessFindOneMock.mockReset();
        userAccessFindOneMock.mockReset();
    });

    const buildUser = (user: any) => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) })
        });
    };

    it('returns success false when the user is not found', async () => {
        buildUser(null);

        const result = await getNavUserAccessService.getNavUserAccess('org1', 'u1');

        expect(userFindByIdMock).toHaveBeenCalledTimes(1);
        expect(userFindByIdMock).toHaveBeenCalledWith('u1');
        expect(result).toEqual({ success: false, message: 'User not found' });
    });

    it('returns role keys and user overrides from the access records', async () => {
        const user = { _id: 'u1', userRole: 'Admin', firstName: 'John', lastName: 'Doe' };
        buildUser(user);
        roleAccessFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ navKeys: ['k1', 'k2'] })
        });
        userAccessFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ addedKeys: ['a1'], removedKeys: ['r1'] })
        });

        const result = await getNavUserAccessService.getNavUserAccess('org1', 'u1');

        expect(roleAccessFindOneMock).toHaveBeenCalledWith({ organization: 'org1', role: 'Admin' });
        expect(userAccessFindOneMock).toHaveBeenCalledWith({ organization: 'org1', userId: 'u1' });
        expect(navItemFindMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            userId: 'u1',
            role: 'Admin',
            surface: surfaceForRole('Admin'),
            roleKeys: ['k1', 'k2'],
            addedKeys: ['a1'],
            removedKeys: ['r1']
        });
    });

    it('falls back to the surface catalog for role keys without an access record', async () => {
        buildUser({ _id: 'u1', userRole: 'Employee', firstName: 'John', lastName: 'Doe' });
        roleAccessFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        userAccessFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ key: 'dashboard' }]) })
        });

        const result = await getNavUserAccessService.getNavUserAccess('org1', 'u1');

        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledWith({ surface: surfaceForRole('Employee') });
        expect(result).toEqual({
            success: true,
            userId: 'u1',
            role: 'Employee',
            surface: surfaceForRole('Employee'),
            roleKeys: ['dashboard'],
            addedKeys: [],
            removedKeys: []
        });
    });

    it('handles a user without a role', async () => {
        buildUser({ _id: 'u1' });
        roleAccessFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        userAccessFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })
        });

        const result = await getNavUserAccessService.getNavUserAccess('org1', 'u1');

        expect(result.role).toBe('');
        expect(result.roleKeys).toEqual([]);
        expect(result.success).toBe(true);
    });
});