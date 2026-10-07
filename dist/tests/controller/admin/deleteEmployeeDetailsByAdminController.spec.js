"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteEmployeeDetailsByAdminController_1 = __importDefault(require("../../../controllers/admin/deleteEmployeeDetailsByAdminController"));
const deleteEmployeeDetailsByAdminService_1 = __importDefault(require("../../../services/admin/deleteEmployeeDetailsByAdminService"));
const manageUserMessages_1 = require("../../../constants/admin/manageUserMessages");
jest.mock('../../../services/admin/deleteEmployeeDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeleteEmployeeProfileByAdmin: jest.fn(),
        softDeleteEmployeeProfileByAdmin: jest.fn(),
    },
}));
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deleteEmployeeDetailsByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { id: 'u1', confirmDelete: true } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('hard deletes the profile when confirmDelete is true', async () => {
        const response = { success: true };
        deleteEmployeeDetailsByAdminService_1.default.hardDeleteEmployeeProfileByAdmin.mockResolvedValue(response);
        deleteEmployeeDetailsByAdminController_1.default.deleteProfile(req, res);
        await flushMicrotasks();
        expect(deleteEmployeeDetailsByAdminService_1.default.hardDeleteEmployeeProfileByAdmin).toHaveBeenCalledWith('u1');
        expect(deleteEmployeeDetailsByAdminService_1.default.softDeleteEmployeeProfileByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('hard delete failure responds with 500 and the hard delete error message', async () => {
        deleteEmployeeDetailsByAdminService_1.default.hardDeleteEmployeeProfileByAdmin.mockRejectedValue({ success: false });
        deleteEmployeeDetailsByAdminController_1.default.deleteProfile(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_USER_HARD_DELETE_ERROR_MESSAGE,
        });
    });
    it('soft deletes the profile when confirmDelete is false', async () => {
        req = { body: { id: 'u1', confirmDelete: false } };
        const response = { success: true };
        deleteEmployeeDetailsByAdminService_1.default.softDeleteEmployeeProfileByAdmin.mockResolvedValue(response);
        deleteEmployeeDetailsByAdminController_1.default.deleteProfile(req, res);
        await flushMicrotasks();
        expect(deleteEmployeeDetailsByAdminService_1.default.softDeleteEmployeeProfileByAdmin).toHaveBeenCalledWith('u1');
        expect(deleteEmployeeDetailsByAdminService_1.default.hardDeleteEmployeeProfileByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('soft delete failure responds with 500 and the soft delete error message', async () => {
        req = { body: { id: 'u1', confirmDelete: false } };
        deleteEmployeeDetailsByAdminService_1.default.softDeleteEmployeeProfileByAdmin.mockRejectedValue({ success: false });
        deleteEmployeeDetailsByAdminController_1.default.deleteProfile(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_USER_SOFT_DELETE_ERROR_MESSAGE,
        });
    });
});
