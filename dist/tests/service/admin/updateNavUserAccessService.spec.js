"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateNavUserAccessService_1 = __importDefault(require("../../../services/admin/updateNavUserAccessService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const navItemModel_1 = __importDefault(require("../../../model/navItemModel"));
const navUserAccessModel_1 = __importDefault(require("../../../model/navUserAccessModel"));
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
const userFindByIdMock = userModel_1.default.findById;
const navItemFindMock = navItemModel_1.default.find;
const findOneAndUpdateMock = navUserAccessModel_1.default.findOneAndUpdate;
describe('updateNavUserAccessService', () => {
    beforeEach(() => {
        userFindByIdMock.mockReset();
        navItemFindMock.mockReset();
        findOneAndUpdateMock.mockReset();
    });
    const buildUser = (user) => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(user) })
        });
    };
    const buildSystemItems = (keys) => {
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(keys.map(key => ({ key }))) })
        });
    };
    it('upserts the user access with de-duplicated keys', async () => {
        buildUser({ _id: 'u1', userRole: 'Admin' });
        buildSystemItems(['sys-1']);
        const updated = { _id: 'ua1', organization: 'org1', userId: 'u1', addedKeys: ['a1'], removedKeys: ['r1'] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });
        const result = await updateNavUserAccessService_1.default.updateNavUserAccess('org1', 'u1', ['a1', 'a1', 'a2'], ['r1', 'sys-1']);
        expect(userFindByIdMock).toHaveBeenCalledTimes(1);
        expect(userFindByIdMock).toHaveBeenCalledWith('u1');
        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith({ organization: 'org1', userId: 'u1' }, { organization: 'org1', userId: 'u1', addedKeys: ['a1', 'a2'], removedKeys: ['r1'] }, { new: true, upsert: true });
        expect(result).toEqual({ success: true, userAccess: updated });
    });
    it('works without a stored role and treats missing arrays as empty', async () => {
        buildUser(null);
        buildSystemItems(['sys-1']);
        const updated = { _id: 'ua1', addedKeys: [], removedKeys: [] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });
        const result = await updateNavUserAccessService_1.default.updateNavUserAccess('org1', 'u1', undefined, undefined);
        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith({ organization: 'org1', userId: 'u1' }, { organization: 'org1', userId: 'u1', addedKeys: [], removedKeys: [] }, { new: true, upsert: true });
        expect(result).toEqual({ success: true, userAccess: updated });
    });
});
