"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getNavRoleAccessController_1 = __importDefault(require("../../../controllers/admin/getNavRoleAccessController"));
const getNavRoleAccessService_1 = __importDefault(require("../../../services/admin/getNavRoleAccessService"));
const navMessages_1 = require("../../../constants/navigation/navMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getNavRoleAccessService', () => ({
    __esModule: true,
    default: {
        getNavRoleAccess: jest.fn()
    }
}));
const getNavRoleAccessServiceMock = getNavRoleAccessService_1.default.getNavRoleAccess;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getNavRoleAccess controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getNavRoleAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the role access when the service resolves', async () => {
        const req = {
            params: { role: 'Admin' },
            user: { organizationId: 'org1' }
        };
        const result = { success: true, role: 'Admin', navKeys: ['k1'], isDefault: false };
        getNavRoleAccessServiceMock.mockResolvedValue(result);
        await getNavRoleAccessController_1.default.getNavRoleAccess(req, res);
        await flushMicrotasks();
        expect(getNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavRoleAccessServiceMock).toHaveBeenCalledWith('org1', 'Admin');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(result);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            params: { role: 'Admin' },
            user: { organizationId: 'org1' }
        };
        getNavRoleAccessServiceMock.mockRejectedValue(new Error('Service failure'));
        await getNavRoleAccessController_1.default.getNavRoleAccess(req, res);
        await flushMicrotasks();
        expect(getNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: navMessages_1.NAV_ERROR_MESSAGES.ROLE_ACCESS_FETCH_ERROR
        });
    });
});
