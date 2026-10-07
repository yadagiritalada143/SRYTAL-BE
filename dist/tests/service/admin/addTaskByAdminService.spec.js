"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTaskByAdminService_1 = __importDefault(require("../../../services/admin/addTaskByAdminService"));
const taskModel_1 = __importDefault(require("../../../model/taskModel"));
jest.mock('../../../model/taskModel', () => {
    const TaskModel = jest.fn();
    return { __esModule: true, default: TaskModel };
});
const TaskModelMock = taskModel_1.default;
describe('addTaskByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        TaskModelMock.mockReset();
        saveSpy = jest.fn();
        TaskModelMock.mockReturnValue({ save: saveSpy });
    });
    it('constructs a task document with the given data and saves it', async () => {
        const taskData = { name: 'Task A', isDeleted: false };
        const savedTask = Object.assign({ _id: 't1' }, taskData);
        saveSpy.mockResolvedValue(savedTask);
        const result = await addTaskByAdminService_1.default.addTaskByAdmin(taskData);
        expect(TaskModelMock).toHaveBeenCalledTimes(1);
        expect(TaskModelMock).toHaveBeenCalledWith(taskData);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedTask);
    });
    it('propagates the error when save fails', async () => {
        const saveError = new Error('Save failed');
        saveSpy.mockRejectedValue(saveError);
        await expect(addTaskByAdminService_1.default.addTaskByAdmin({ name: 'Task B' })).rejects.toThrow(saveError);
        expect(TaskModelMock).toHaveBeenCalledTimes(1);
        expect(TaskModelMock).toHaveBeenCalledWith({ name: 'Task B' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
    });
});
