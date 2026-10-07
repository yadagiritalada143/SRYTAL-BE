import getAllEmployeesBySuperadminService from '../../../services/superadmin/getAllEmployeesBySuperadminService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).find = jest.fn();
    return { __esModule: true, default: UserModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & { find: jest.Mock };

const buildFindChain = (mock: jest.Mock, users: any, shouldReject = false) => {
    const thenChain: any = {};
    const chain: any = {};
    chain.then = (onFulfilled: any) => {
        if (!shouldReject) {
            onFulfilled(users);
        }
        return thenChain;
    };
    thenChain.catch = (onRejected: any) => {
        if (shouldReject) {
            onRejected(users);
        }
    };
    mock.mockReturnValue(chain);
    return chain;
};

describe('getAllEmployeesBySuperadminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.find = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with employee list when users are found', async () => {
        const users = [
            { _id: 'u1', firstName: 'John', lastName: 'Doe' },
            { _id: 'u2', firstName: 'Jane', lastName: 'Smith' }
        ];
        buildFindChain(UserModelMock.find, users);

        const result = await getAllEmployeesBySuperadminService.getAllEmployeesBySuperadmin('org1');

        expect(UserModelMock.find).toHaveBeenCalledWith({ organization: 'org1' });
        expect(result).toEqual({
            success: true,
            superadminEmployeeList: users
        });
    });

    it('rejects with success false when users is null', async () => {
        buildFindChain(UserModelMock.find, null);

        await expect(getAllEmployeesBySuperadminService.getAllEmployeesBySuperadmin('org1'))
            .rejects.toEqual({ success: false });
    });

    it('rejects with success false and logs when the query fails', async () => {
        buildFindChain(UserModelMock.find, new Error('DB error'), true);

        await expect(getAllEmployeesBySuperadminService.getAllEmployeesBySuperadmin('org1'))
            .rejects.toEqual({ success: false });
        expect(console.error).toHaveBeenCalled();
    });
});
