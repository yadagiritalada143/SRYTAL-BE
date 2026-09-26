"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteTaskByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteTaskByAdminController"));
const deleteTaskByAdminService_1 = __importDefault(require("../../../services/admin/deleteTaskByAdminService"));
const taskMessages_1 = require("../../../constants/admin/taskMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/deleteTaskByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeleteTaskByAdmin: jest.fn(),
        softDeleteTaskByAdmin: jest.fn()
    }
}));
const hardDeleteTaskByAdminMock = deleteTaskByAdminService_1.default.hardDeleteTaskByAdmin;
const softDeleteTaskByAdminMock = deleteTaskByAdminService_1.default.softDeleteTaskByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteTaskByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        hardDeleteTaskByAdminMock.mockReset();
        softDeleteTaskByAdminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('performs a hard delete and returns 200 when confirmDelete is true', async () => {
        const req = {
            params: { id: 't1' },
            body: { confirmDelete: true }
        };
        hardDeleteTaskByAdminMock.mockResolvedValue({ success: true });
        await deleteTaskByAdminController_1.default.deleteTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(hardDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(hardDeleteTaskByAdminMock).toHaveBeenCalledWith('t1');
        expect(softDeleteTaskByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 500 with the hard delete error when the hard delete fails', async () => {
        const req = {
            params: { id: 't1' },
            body: { confirmDelete: true }
        };
        hardDeleteTaskByAdminMock.mockRejectedValue({ success: false });
        await deleteTaskByAdminController_1.default.deleteTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(hardDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_HARD_DELETE_ERROR_MESSAGE
        });
    });
    it('performs a soft delete and returns 200 when confirmDelete is falsy', async () => {
        const req = {
            params: { id: 't1' },
            body: { confirmDelete: false }
        };
        softDeleteTaskByAdminMock.mockResolvedValue({ success: true });
        await deleteTaskByAdminController_1.default.deleteTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(softDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(softDeleteTaskByAdminMock).toHaveBeenCalledWith('t1');
        expect(hardDeleteTaskByAdminMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 500 with the soft delete error when the soft delete fails', async () => {
        const req = {
            params: { id: 't1' },
            body: {}
        };
        softDeleteTaskByAdminMock.mockRejectedValue({ success: false });
        await deleteTaskByAdminController_1.default.deleteTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(softDeleteTaskByAdminMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_SOFT_DELETE_ERROR_MESSAGE
        });
    });
});
