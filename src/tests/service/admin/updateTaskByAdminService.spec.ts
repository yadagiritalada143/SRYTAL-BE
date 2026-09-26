import updateTaskByAdminService from '../../../services/admin/updateTaskByAdminService';
import TaskModel from '../../../model/taskModel';

jest.mock('../../../model/taskModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (TaskModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updateTaskByAdminService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        updateOneMock.mockResolvedValue({});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns success with the update result when updateOne resolves', async () => {
        const updateResult = { modifiedCount: 1 };
        const taskDetails = { id: 't1', name: 'Task A' };
        updateOneMock.mockResolvedValue(updateResult);

        const result = await updateTaskByAdminService.updateTaskByAdmin(taskDetails);

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 't1' }, { ...taskDetails });
        expect(result).toEqual({ success: true, responseAfterUpdate: updateResult });
    });

    it('returns success false when updateOne resolves a falsy value', async () => {
        updateOneMock.mockResolvedValue(null);

        const result = await updateTaskByAdminService.updateTaskByAdmin({ id: 't1' });

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });

    it('returns the error in the response when updateOne rejects', async () => {
        const updateError = new Error('Update failed');
        updateOneMock.mockRejectedValue(updateError);

        const result = await updateTaskByAdminService.updateTaskByAdmin({ id: 't1' });

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, responseAfterUpdate: updateError });
    });
});