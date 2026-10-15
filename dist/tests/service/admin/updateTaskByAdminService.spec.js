"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateTaskByAdminService_1 = __importDefault(require("../../../services/admin/updateTaskByAdminService"));
const taskModel_1 = __importDefault(require("../../../model/taskModel"));
jest.mock('../../../model/taskModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = taskModel_1.default.updateOne;
describe('updateTaskByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        updateOneMock.mockResolvedValue({});
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns success with the update result when updateOne resolves', async () => {
        const updateResult = { modifiedCount: 1 };
        const taskDetails = { id: 't1', name: 'Task A' };
        updateOneMock.mockResolvedValue(updateResult);
        const result = await updateTaskByAdminService_1.default.updateTaskByAdmin(taskDetails);
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, Object.assign({}, taskDetails));
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });
    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);
        const result = await updateTaskByAdminService_1.default.updateTaskByAdmin({ id: 't1' });
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
    it('returns the error in the response when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);
        const result = await updateTaskByAdminService_1.default.updateTaskByAdmin({ id: 't1' });
        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});
