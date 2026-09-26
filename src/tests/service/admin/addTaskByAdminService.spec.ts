import addTaskByAdminService from '../../../services/admin/addTaskByAdminService';
import TaskModel from '../../../model/taskModel';

jest.mock('../../../model/taskModel', () => {
    const TaskModel = jest.fn();
    return { __esModule: true, default: TaskModel };
});

const TaskModelMock = TaskModel as unknown as jest.Mock;

describe('addTaskByAdminService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        TaskModelMock.mockReset();
        saveSpy = jest.fn();
        TaskModelMock.mockReturnValue({ save: saveSpy });
    });

    it('constructs a task document with the given data and saves it', async () => {
        const taskData = { name: 'Task A', isDeleted: false };
        const savedTask = { _id: 't1', ...taskData };
        saveSpy.mockResolvedValue(savedTask);

        const result = await addTaskByAdminService.addTaskByAdmin(taskData);

        expect(TaskModelMock).toHaveBeenCalledTimes(1);
        expect(TaskModelMock).toHaveBeenCalledWith(taskData);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedTask);
    });

    it('propagates the error when save fails', async () => {
        const saveError = new Error('Save failed');
        saveSpy.mockRejectedValue(saveError);

        await expect(addTaskByAdminService.addTaskByAdmin({ name: 'Task B' })).rejects.toThrow(saveError);

        expect(TaskModelMock).toHaveBeenCalledTimes(1);
        expect(TaskModelMock).toHaveBeenCalledWith({ name: 'Task B' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});