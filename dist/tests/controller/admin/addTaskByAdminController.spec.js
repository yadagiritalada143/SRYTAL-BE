"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTaskByAdminController_1 = __importDefault(require("../../../controllers/admin/addTaskByAdminController"));
const addTaskByAdminService_1 = __importDefault(require("../../../services/admin/addTaskByAdminService"));
const taskMessages_1 = require("../../../constants/admin/taskMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/addTaskByAdminService', () => ({
    __esModule: true,
    default: {
        addTaskByAdmin: jest.fn()
    }
}));
const addTaskByAdminServiceMock = addTaskByAdminService_1.default.addTaskByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addTaskByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addTaskByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the add response, decorating the body with dates and metadata', async () => {
        const req = {
            body: { name: 'Task A' },
            user: { userId: 'u1' }
        };
        const addResponse = { _id: 't1' };
        addTaskByAdminServiceMock.mockResolvedValue(addResponse);
        await addTaskByAdminController_1.default.addTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(addTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addTaskByAdminServiceMock).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Task A',
            createdAt: expect.any(Date),
            lastUpdatedAt: expect.any(Date),
            createdBy: 'u1',
            isDeleted: false
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(addResponse);
    });
    it('leaves createdBy undefined when req.user has no userId', async () => {
        const req = {
            body: { name: 'Task B' },
            user: {}
        };
        addTaskByAdminServiceMock.mockResolvedValue({ _id: 't2' });
        await addTaskByAdminController_1.default.addTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(addTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addTaskByAdminServiceMock).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Task B',
            createdBy: undefined,
            isDeleted: false
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { name: 'Task C' } };
        addTaskByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await addTaskByAdminController_1.default.addTaskByAdmin(req, res);
        await flushMicrotasks();
        expect(addTaskByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: taskMessages_1.TASK_ERROR_MESSAGES.TASK_ADD_ERROR_MESSAGE
        });
    });
});
