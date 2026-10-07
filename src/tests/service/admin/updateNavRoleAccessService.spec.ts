import updateNavRoleAccessService from '../../../services/admin/updateNavRoleAccessService';
import NavItemModel from '../../../model/navItemModel';
import NavRoleAccessModel from '../../../model/navRoleAccessModel';
import { surfaceForRole } from '../../../services/navigation/navResolver';

jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/navRoleAccessModel', () => ({
    __esModule: true,
    default: { findOneAndUpdate: jest.fn() }
}));

const navItemFindMock = (NavItemModel as unknown as { find: jest.Mock }).find;
const findOneAndUpdateMock = (NavRoleAccessModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;

describe('updateNavRoleAccessService', () => {
    beforeEach(() => {
        navItemFindMock.mockReset();
        findOneAndUpdateMock.mockReset();
    });

    const buildSystemItems = (keys: string[]) => {
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(keys.map(key => ({ key }))) })
        });
    };

    it('merges nav keys with system keys and upserts the role access', async () => {
        const role = 'Admin';
        buildSystemItems(['k2', 'system-key']);
        const updated = { _id: 'ra1', organization: 'org1', role, navKeys: ['k1', 'k2', 'system-key'] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });

        const result = await updateNavRoleAccessService.updateNavRoleAccess('org1', role, ['k1', 'k2']);

        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledWith({ surface: surfaceForRole(role), isSystem: true });
        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
            { organization: 'org1', role },
            { organization: 'org1', role, navKeys: ['k1', 'k2', 'system-key'] },
            { new: true, upsert: true }
        );
        expect(result).toEqual({ success: true, roleAccess: updated });
    });

    it('treats missing nav keys as an empty array', async () => {
        const role = 'Employee';
        buildSystemItems(['sys']);
        const updated = { _id: 'ra1', navKeys: ['sys'] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });

        const result = await updateNavRoleAccessService.updateNavRoleAccess('org1', role, undefined as any);

        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
            { organization: 'org1', role },
            { organization: 'org1', role, navKeys: ['sys'] },
            { new: true, upsert: true }
        );
        expect(result).toEqual({ success: true, roleAccess: updated });
    });
});