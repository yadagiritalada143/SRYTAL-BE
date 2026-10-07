"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getNavUserAccessController_1 = __importDefault(require("../../../controllers/admin/getNavUserAccessController"));
const getNavUserAccessService_1 = __importDefault(require("../../../services/admin/getNavUserAccessService"));
const navMessages_1 = require("../../../constants/navigation/navMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getNavUserAccessService', () => ({
    __esModule: true,
    default: {
        getNavUserAccess: jest.fn()
    }
}));
const getNavUserAccessServiceMock = getNavUserAccessService_1.default.getNavUserAccess;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getNavUserAccess controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getNavUserAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the user access when the service resolves', async () => {
        const req = {
            params: { userId: 'u1' },
            user: { organizationId: 'org1' }
        };
        const result = { success: true, userId: 'u1', roleKeys: ['k1'], addedKeys: [], removedKeys: [] };
        getNavUserAccessServiceMock.mockResolvedValue(result);
        await getNavUserAccessController_1.default.getNavUserAccess(req, res);
        await flushMicrotasks();
        expect(getNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavUserAccessServiceMock).toHaveBeenCalledWith('org1', 'u1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(result);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            params: { userId: 'u1' },
            user: { organizationId: 'org1' }
        };
        getNavUserAccessServiceMock.mockRejectedValue(new Error('Service failure'));
        await getNavUserAccessController_1.default.getNavUserAccess(req, res);
        await flushMicrotasks();
        expect(getNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: navMessages_1.NAV_ERROR_MESSAGES.USER_ACCESS_FETCH_ERROR
        });
    });
});
