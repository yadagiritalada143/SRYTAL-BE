import updateNavUserAccessService from '../../../services/admin/updateNavUserAccessService';
import UserModel from '../../../model/userModel';
import NavItemModel from '../../../model/navItemModel';
import NavUserAccessModel from '../../../model/navUserAccessModel';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/navUserAccessModel', () => ({
    __esModule: true,
    default: { findOneAndUpdate: jest.fn() }
}));

const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;
const navItemFindMock = (NavItemModel as unknown as { find: jest.Mock }).find;
const findOneAndUpdateMock = (NavUserAccessModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;

describe('updateNavUserAccessService', () => {
    beforeEach(() => {
        userFindByIdMock.mockReset();
        navItemFindMock.mockReset();
        findOneAndUpdateMock.mockReset();
    });

    const buildUser = (user: any) => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) })
        });
    };

    const buildSystemItems = (keys: string[]) => {
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(keys.map(key => ({ key }))) })
        });
    };

    it('upserts the user access with de-duplicated keys', async () => {
        buildUser({ _id: 'u1', userRole: 'Admin' });
        buildSystemItems(['sys-1']);
        const updated = { _id: 'ua1', organization: 'org1', userId: 'u1', addedKeys: ['a1'], removedKeys: ['r1'] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });

        const result = await updateNavUserAccessService.updateNavUserAccess(
            'org1',
            'u1',
            ['a1', 'a1', 'a2'],
            ['r1', 'sys-1']
        );

        expect(userFindByIdMock).toHaveBeenCalledTimes(1);
        expect(userFindByIdMock).toHaveBeenCalledWith('u1');
        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
            { organization: 'org1', userId: 'u1' },
            { organization: 'org1', userId: 'u1', addedKeys: ['a1', 'a2'], removedKeys: ['r1'] },
            { new: true, upsert: true }
        );
        expect(result).toEqual({ success: true, userAccess: updated });
    });

    it('works without a stored role and treats missing arrays as empty', async () => {
        buildUser(null);
        buildSystemItems(['sys-1']);
        const updated = { _id: 'ua1', addedKeys: [], removedKeys: [] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });

        const result = await updateNavUserAccessService.updateNavUserAccess(
            'org1',
            'u1',
            undefined as any,
            undefined as any
        );

        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith(
            { organization: 'org1', userId: 'u1' },
            { organization: 'org1', userId: 'u1', addedKeys: [], removedKeys: [] },
            { new: true, upsert: true }
        );
        expect(result).toEqual({ success: true, userAccess: updated });
    });
});