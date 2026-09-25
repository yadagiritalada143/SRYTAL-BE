"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deletePoolCandidatesByAdminController_1 = __importDefault(require("../../../controllers/admin/deletePoolCandidatesByAdminController"));
const deletePoolCandidatesByAdminService_1 = __importDefault(require("../../../services/admin/deletePoolCandidatesByAdminService"));
const manageUserMessages_1 = require("../../../constants/admin/manageUserMessages");
jest.mock('../../../services/admin/deletePoolCandidatesByAdminService', () => ({
    __esModule: true,
    default: {
        hardDeletePoolCandidateByAdmin: jest.fn(),
        softDeletePoolCandidateByAdmin: jest.fn(),
    },
}));
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('deletePoolCandidatesByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { params: { id: 'c1' }, body: { confirmDelete: true } };
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
    it('hard deletes the pool candidate when confirmDelete is true', async () => {
        const response = { success: true };
        deletePoolCandidatesByAdminService_1.default.hardDeletePoolCandidateByAdmin.mockResolvedValue(response);
        deletePoolCandidatesByAdminController_1.default.deletePoolCandidateByAdmin(req, res);
        await flushMicrotasks();
        expect(deletePoolCandidatesByAdminService_1.default.hardDeletePoolCandidateByAdmin).toHaveBeenCalledWith('c1');
        expect(deletePoolCandidatesByAdminService_1.default.softDeletePoolCandidateByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('hard delete failure responds with 500 and the soft-delete message', async () => {
        deletePoolCandidatesByAdminService_1.default.hardDeletePoolCandidateByAdmin.mockRejectedValue({ success: false });
        deletePoolCandidatesByAdminController_1.default.deletePoolCandidateByAdmin(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_SOFT_DELETE_ERROR_MESSAGE,
        });
    });
    it('soft deletes the pool candidate when confirmDelete is false', async () => {
        req = { params: { id: 'c1' }, body: { confirmDelete: false } };
        const response = { success: true };
        deletePoolCandidatesByAdminService_1.default.softDeletePoolCandidateByAdmin.mockResolvedValue(response);
        deletePoolCandidatesByAdminController_1.default.deletePoolCandidateByAdmin(req, res);
        await flushMicrotasks();
        expect(deletePoolCandidatesByAdminService_1.default.softDeletePoolCandidateByAdmin).toHaveBeenCalledWith('c1');
        expect(deletePoolCandidatesByAdminService_1.default.hardDeletePoolCandidateByAdmin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('soft delete failure responds with 500 and the hard-delete message', async () => {
        req = { params: { id: 'c1' }, body: { confirmDelete: false } };
        deletePoolCandidatesByAdminService_1.default.softDeletePoolCandidateByAdmin.mockRejectedValue({ success: false });
        deletePoolCandidatesByAdminController_1.default.deletePoolCandidateByAdmin(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: manageUserMessages_1.DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_HARD_DELETE_ERROR_MESSAGE,
        });
    });
});
