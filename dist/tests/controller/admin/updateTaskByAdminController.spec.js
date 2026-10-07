"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateTaskByAdminController_1 = __importDefault(require("../../../controllers/admin/updateTaskByAdminController"));
const updateTaskByAdminService_1 = __importDefault(require("../../../services/admin/updateTaskByAdminService"));
const taskMessages_1 = require("../../../constants/admin/taskMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateTaskByAdminService', () => ({
    __esModule: true,
    default: {
        updateTaskByAdmin: jest.fn()
    }
}));
const updateTaskByAdminServiceMock = updateTaskByAdminService_1.default.updateTaskByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateTaskByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateTaskByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the update response, decorating the body with lastUpdatedBy', async () => {
        const req = { body: { id: 't1', name: 'Task A' } };
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateTaskByAdminServiceMock.mockResolvedValue(updateResponse);
        await updateTaskByAdminController_1.default.updateTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(updateTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateTaskByAdminServiceMock).toHaveBeenCalledWith(expect.objectContaining({
            id: 't1',
            name: 'Task A',
            lastUpdatedBy: expect.any(Date)
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 't1', name: 'Task A' } };
        updateTaskByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await updateTaskByAdminController_1.default.updateTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(updateTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_UPDATING_ERROR_MESSAGE
        });
    });
});
