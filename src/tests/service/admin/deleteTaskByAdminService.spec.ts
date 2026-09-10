import deleteTaskByAdminService from '../../../services/admin/deleteTaskByAdminService';
import TaskModel from '../../../model/taskModel';

jest.mock('../../../model/taskModel', () => ({
    __esModule: true,
    default: { deleteOne: jest.fn(), updateOne: jest.fn() }
}));

const deleteOneMock = (TaskModel as unknown as { deleteOne: jest.Mock }).deleteOne;
const updateOneMock = (TaskModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('deleteTaskByAdminService', () => {
    beforeEach(() => {
        deleteOneMock.mockReset();
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('hardDeleteTaskByAdmin', () => {
        it('resolves success true when the task is deleted', async () => {
            deleteOneMock.mockResolvedValue({ deletedCount: 1 });

            const result = await deleteTaskByAdminService.hardDeleteTaskByAdmin('t1');

            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 't1' });
            expect(result).toEqual({ success: true });
        });

        it('rejects with success false when deletion fails', async () => {
            deleteOneMock.mockRejectedValue(new Error('Delete failed'));

            await expect(deleteTaskByAdminService.hardDeleteTaskByAdmin('t1')).rejects.toEqual({ success: false });

            expect(deleteOneMock).toHaveBeenCalledTimes(1);
            expect(deleteOneMock).toHaveBeenCalledWith({ _id: 't1' });
        });
    });

    describe('softDeleteTaskByAdmin', () => {
        it('resolves success true when the task is soft deleted', async () => {
            updateOneMock.mockResolvedValue({ modifiedCount: 1 });

            const result = await deleteTaskByAdminService.softDeleteTaskByAdmin('t1');

            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, { isDeleted: true });
            expect(result).toEqual({ success: true });
        });

        it('rejects with success false when soft deletion fails', async () => {
            updateOneMock.mockRejectedValue(new Error('Soft delete failed'));

            await expect(deleteTaskByAdminService.softDeleteTaskByAdmin('t1')).rejects.toEqual({ success: false });

            expect(updateOneMock).toHaveBeenCalledTimes(1);
            expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, { isDeleted: true });
        });
    });
});