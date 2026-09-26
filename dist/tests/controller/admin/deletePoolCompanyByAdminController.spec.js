"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePoolCompanyByAdminController_1 = __importDefault(require("../../../controllers/admin/deletePoolCompanyByAdminController"));
const deletePoolCompanyByAdminService_1 = __importDefault(require("../../../services/admin/deletePoolCompanyByAdminService"));
const manageUserMessages_1 = require("../../../constants/admin/manageUserMessages");
jest.mock('../../../services/admin/deletePoolCompanyByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeletePoolCompanyByAdmin: jest.fn(),
        softDeletePoolCompanyByAdmin: jest.fn(),
    },
}));
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deletePoolCompanyByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { params: { id: 'co1' }, body: { confirmDelete: true } };
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
    it('hard deletes the pool company when confirmDelete is true', async () => {
        const response = { success: true };
        deletePoolCompanyByAdminService_1.default.hardDeletePoolCompanyByAdmin.mockResolvedValue(response);
        deletePoolCompanyByAdminController_1.default.deletePoolCompanyByAdmin(req, res);
        await flushMicrotasks();
        expect(deletePoolCompanyByAdminService_1.default.hardDeletePoolCompanyByAdmin).toHaveBeenCalledWith('co1');
        expect(deletePoolCompanyByAdminService_1.default.softDeletePoolCompanyByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('hard delete failure responds with 500 and the soft-delete message', async () => {
        deletePoolCompanyByAdminService_1.default.hardDeletePoolCompanyByAdmin.mockRejectedValue({ success: false });
        deletePoolCompanyByAdminController_1.default.deletePoolCompanyByAdmin(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_SOFT_DELETE_ERROR_MESSAGE,
        });
    });
    it('soft deletes the pool company when confirmDelete is false', async () => {
        req = { params: { id: 'co1' }, body: { confirmDelete: false } };
        const response = { success: true };
        deletePoolCompanyByAdminService_1.default.softDeletePoolCompanyByAdmin.mockResolvedValue(response);
        deletePoolCompanyByAdminController_1.default.deletePoolCompanyByAdmin(req, res);
        await flushMicrotasks();
        expect(deletePoolCompanyByAdminService_1.default.softDeletePoolCompanyByAdmin).toHaveBeenCalledWith('co1');
        expect(deletePoolCompanyByAdminService_1.default.hardDeletePoolCompanyByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('soft delete failure responds with 500 and the hard-delete message', async () => {
        req = { params: { id: 'co1' }, body: { confirmDelete: false } };
        deletePoolCompanyByAdminService_1.default.softDeletePoolCompanyByAdmin.mockRejectedValue({ success: false });
        deletePoolCompanyByAdminController_1.default.deletePoolCompanyByAdmin(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_HARD_DELETE_ERROR_MESSAGE,
        });
    });
});
