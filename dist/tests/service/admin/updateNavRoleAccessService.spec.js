"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateNavRoleAccessService_1 = __importDefault(require("../../../services/admin/updateNavRoleAccessService"));
const navItemModel_1 = __importDefault(require("../../../model/navItemModel"));
const navRoleAccessModel_1 = __importDefault(require("../../../model/navRoleAccessModel"));
const navResolver_1 = require("../../../services/navigation/navResolver");
jest.mock('../../../model/navItemModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
jest.mock('../../../model/navRoleAccessModel', () => ({
    __esModule: true,
    default: { findOneAndUpdate: jest.fn() }
}));
const navItemFindMock = navItemModel_1.default.find;
const findOneAndUpdateMock = navRoleAccessModel_1.default.findOneAndUpdate;
describe('updateNavRoleAccessService', () => {
    beforeEach(() => {
        navItemFindMock.mockReset();
        findOneAndUpdateMock.mockReset();
    });
    const buildSystemItems = (keys) => {
        navItemFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(keys.map(key => ({ key }))) })
        });
    };
    it('merges nav keys with system keys and upserts the role access', async () => {
        const role = 'Admin';
        buildSystemItems(['k2', 'system-key']);
        const updated = { _id: 'ra1', organization: 'org1', role, navKeys: ['k1', 'k2', 'system-key'] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });
        const result = await updateNavRoleAccessService_1.default.updateNavRoleAccess('org1', role, ['k1', 'k2']);
        expect(navItemFindMock).toHaveBeenCalledTimes(1);
        expect(navItemFindMock).toHaveBeenCalledWith({ surface: (0, navResolver_1.surfaceForRole)(role), isSystem: true });
        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith({ organization: 'org1', role }, { organization: 'org1', role, navKeys: ['k1', 'k2', 'system-key'] }, { new: true, upsert: true });
        expect(result).toEqual({ success: true, roleAccess: updated });
    });
    it('treats missing nav keys as an empty array', async () => {
        const role = 'Employee';
        buildSystemItems(['sys']);
        const updated = { _id: 'ra1', navKeys: ['sys'] };
        findOneAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });
        const result = await updateNavRoleAccessService_1.default.updateNavRoleAccess('org1', role, undefined);
        expect(findOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateMock).toHaveBeenCalledWith({ organization: 'org1', role }, { organization: 'org1', role, navKeys: ['sys'] }, { new: true, upsert: true });
        expect(result).toEqual({ success: true, roleAccess: updated });
    });
});
