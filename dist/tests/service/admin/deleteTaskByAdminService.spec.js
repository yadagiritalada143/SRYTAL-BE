"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteTaskByAdminService_1 = __importDefault(require("../../../services/admin/deleteTaskByAdminService"));
const taskModel_1 = __importDefault(require("../../../model/taskModel"));
jest.mock('../../../model/taskModel', () => ({
    __esModule: true,
    default: { deleteOne: jest.fn(), updateOne: jest.fn() }
}));
const deleteOneMock = taskModel_1.default.deleteOne;
const updateOneMock = taskModel_1.default.updateOne;
describe('deleteTaskByAdminService', () => {
    beforeEach(() => {
        deleteOneMock.mockReset();
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('hardDeleteTaskByAdmin', () => {
        it('resolves success true when the task is deleted', async () => {
            deleteOneMock.mockResolvedValue({ deletedCount: 1 });
            const result = await deleteTaskByAdminService_1.default.hardDeleteTaskByAdmin('t1');
            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 't1' });
            expect(result).toEqual({ success: true });
        });
        it('rejects with success false when deletion fails', async () => {
            deleteOneMock.mockRejectedValue(new Error('Delete failed'));
            await expect(deleteTaskByAdminService_1.default.hardDeleteTaskByAdmin('t1')).rejects.toEqual({ success: false });
            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 't1' });
        });
    });
    describe('softDeleteTaskByAdmin', () => {
        it('resolves success true when the task is soft deleted', async () => {
            updateOneMock.mockResolvedValue({ modifiedCount: 1 });
            const result = await deleteTaskByAdminService_1.default.softDeleteTaskByAdmin('t1');
            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, { isDeleted: true });
            expect(result).toEqual({ success: true });
        });
        it('rejects with success false when soft deletion fails', async () => {
            updateOneMock.mockRejectedValue(new Error('Soft delete failed'));
            await expect(deleteTaskByAdminService_1.default.softDeleteTaskByAdmin('t1')).rejects.toEqual({ success: false });
            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, { isDeleted: true });
        });
    });
});
