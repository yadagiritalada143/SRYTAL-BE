"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateApplicationWalkThroughController_1 = __importDefault(require("../../../controllers/common/updateApplicationWalkThroughController"));
const updateAppWalkThroughService_1 = __importDefault(require("../../../services/common/updateAppWalkThroughService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/common/updateAppWalkThroughService', () => ({
    __esModule: true,
    default: { updateAppWalkThrough: jest.fn() }
}));
const updateAppWalkThroughServiceMock = updateAppWalkThroughService_1.default.updateAppWalkThrough;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateApplicationWalkThroughController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateAppWalkThroughServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with success true when the walk through is updated', async () => {
        const req = { body: { user_id: 'u1', applicationWalkThrough: 1 } };
        updateAppWalkThroughServiceMock.mockResolvedValue({ nModified: 1 });
        await updateApplicationWalkThroughController_1.default.updateApplicationWalkThrough(req, res);
        await flushMicrotasks();
        expect(updateAppWalkThroughServiceMock).toHaveBeenCalledWith({
            user_id: 'u1',
            applicationWalkThrough: 1
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 401 with the error message when the service throws', async () => {
        const req = { body: { user_id: 'u1', applicationWalkThrough: 1 } };
        updateAppWalkThroughServiceMock.mockRejectedValue(new Error('boom'));
        await updateApplicationWalkThroughController_1.default.updateApplicationWalkThrough(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.APPLICATION_WALK_THROUGH_ERROR_MESSAGE.UPDATE_APP_WALK_THROUGH_ERROR
        });
    });
});
