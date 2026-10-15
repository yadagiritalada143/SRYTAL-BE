"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateAppWalkThroughService_1 = __importDefault(require("../../../services/common/updateAppWalkThroughService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = userModel_1.default.updateOne;
describe('updateAppWalkThroughService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates the walk through flag and returns the result', async () => {
        const result = { nModified: 1 };
        updateOneMock.mockResolvedValue(result);
        const response = await updateAppWalkThroughService_1.default.updateAppWalkThrough({
            user_id: 'u1',
            applicationWalkThrough: '1'
        });
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'u1' }, { applicationWalkThrough: 1 });
        expect(response).toEqual(result);
    });
    it('returns the error when the update throws', async () => {
        const updateError = new Error('DB down');
        updateOneMock.mockRejectedValue(updateError);
        const response = await updateAppWalkThroughService_1.default.updateAppWalkThrough({
            user_id: 'u1',
            applicationWalkThrough: 0
        });
        expect(response).toBe(updateError);
    });
});
