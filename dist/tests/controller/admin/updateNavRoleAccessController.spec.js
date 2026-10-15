"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateNavRoleAccessController_1 = __importDefault(require("../../../controllers/admin/updateNavRoleAccessController"));
const updateNavRoleAccessService_1 = __importDefault(require("../../../services/admin/updateNavRoleAccessService"));
const navMessages_1 = require("../../../constants/navigation/navMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateNavRoleAccessService', () => ({
    __esModule: true,
    default: {
        updateNavRoleAccess: jest.fn()
    }
}));
const updateNavRoleAccessServiceMock = updateNavRoleAccessService_1.default.updateNavRoleAccess;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateNavRoleAccess controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateNavRoleAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 400 when the role is missing', async () => {
        const req = { body: { navKeys: ['k1'] } };
        await updateNavRoleAccessController_1.default.updateNavRoleAccess(req, res);
        expect(updateNavRoleAccessServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'role is required' });
    });
    it('returns 200 with the success message when the service resolves', async () => {
        const req = {
            body: { role: 'Admin', navKeys: ['k1'] },
            user: { organizationId: 'org1' }
        };
        const result = { success: true, roleAccess: { _id: 'ra1' } };
        updateNavRoleAccessServiceMock.mockResolvedValue(result);
        await updateNavRoleAccessController_1.default.updateNavRoleAccess(req, res);
        await flushMicrotasks();
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledWith('org1', 'Admin', ['k1']);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(Object.assign(Object.assign({}, result), { message: navMessages_1.NAV_SUCCESS_MESSAGES.ROLE_ACCESS_UPDATED }));
    });
    it('passes an empty array when navKeys is missing', async () => {
        const req = {
            body: { role: 'Employee' },
            user: { organizationId: 'org1' }
        };
        updateNavRoleAccessServiceMock.mockResolvedValue({ success: true });
        await updateNavRoleAccessController_1.default.updateNavRoleAccess(req, res);
        await flushMicrotasks();
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledWith('org1', 'Employee', []);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            body: { role: 'Admin', navKeys: ['k1'] },
            user: { organizationId: 'org1' }
        };
        updateNavRoleAccessServiceMock.mockRejectedValue(new Error('Service failure'));
        await updateNavRoleAccessController_1.default.updateNavRoleAccess(req, res);
        await flushMicrotasks();
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: navMessages_1.NAV_ERROR_MESSAGES.ROLE_ACCESS_UPDATE_ERROR
        });
    });
});
