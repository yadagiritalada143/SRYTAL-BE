"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateNavUserAccessController_1 = __importDefault(require("../../../controllers/admin/updateNavUserAccessController"));
const updateNavUserAccessService_1 = __importDefault(require("../../../services/admin/updateNavUserAccessService"));
const navMessages_1 = require("../../../constants/navigation/navMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateNavUserAccessService', () => ({
    __esModule: true,
    default: {
        updateNavUserAccess: jest.fn()
    }
}));
const updateNavUserAccessServiceMock = updateNavUserAccessService_1.default.updateNavUserAccess;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateNavUserAccess controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateNavUserAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 400 when the userId is missing', async () => {
        const req = { body: { addedKeys: ['a1'] } };
        await updateNavUserAccessController_1.default.updateNavUserAccess(req, res);
        expect(updateNavUserAccessServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'userId is required' });
    });
    it('returns 200 with the success message when the service resolves', async () => {
        const req = {
            body: { userId: 'u1', addedKeys: ['a1'], removedKeys: ['r1'] },
            user: { organizationId: 'org1' }
        };
        const result = { success: true, userAccess: { _id: 'ua1' } };
        updateNavUserAccessServiceMock.mockResolvedValue(result);
        await updateNavUserAccessController_1.default.updateNavUserAccess(req, res);
        await flushMicrotasks();
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledWith('org1', 'u1', ['a1'], ['r1']);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(Object.assign(Object.assign({}, result), { message: navMessages_1.NAV_SUCCESS_MESSAGES.USER_ACCESS_UPDATED }));
    });
    it('passes empty arrays when the key arrays are missing', async () => {
        const req = {
            body: { userId: 'u1' },
            user: { organizationId: 'org1' }
        };
        updateNavUserAccessServiceMock.mockResolvedValue({ success: true });
        await updateNavUserAccessController_1.default.updateNavUserAccess(req, res);
        await flushMicrotasks();
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledWith('org1', 'u1', [], []);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            body: { userId: 'u1', addedKeys: ['a1'], removedKeys: ['r1'] },
            user: { organizationId: 'org1' }
        };
        updateNavUserAccessServiceMock.mockRejectedValue(new Error('Service failure'));
        await updateNavUserAccessController_1.default.updateNavUserAccess(req, res);
        await flushMicrotasks();
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: navMessages_1.NAV_ERROR_MESSAGES.USER_ACCESS_UPDATE_ERROR
        });
    });
});
