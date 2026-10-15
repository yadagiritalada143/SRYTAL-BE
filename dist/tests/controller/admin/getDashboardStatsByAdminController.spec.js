"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getDashboardStatsByAdminController_1 = __importDefault(require("../../../controllers/admin/getDashboardStatsByAdminController"));
const getDashboardStatsByAdminService_1 = __importDefault(require("../../../services/admin/getDashboardStatsByAdminService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getDashboardStatsByAdminService', () => ({
    __esModule: true,
    default: {
        getDashboardStatsByAdmin: jest.fn(),
    },
}));
describe('getDashboardStatsByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { user: { organizationId: 'org1', userId: 'adminId' } };
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
    it('responds with 200 and the dashboard stats on success', async () => {
        const result = { success: true, stats: { totalEmployees: 3 } };
        getDashboardStatsByAdminService_1.default.getDashboardStatsByAdmin.mockResolvedValue(result);
        await getDashboardStatsByAdminController_1.default.getDashboardStats(req, res);
        expect(getDashboardStatsByAdminService_1.default.getDashboardStatsByAdmin).toHaveBeenCalledWith('org1', 'adminId');
        expect(res.status).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(result);
    });
    it('passes undefined org/user when req.user is missing', async () => {
        req.user = undefined;
        getDashboardStatsByAdminService_1.default.getDashboardStatsByAdmin.mockResolvedValue({ success: true });
        await getDashboardStatsByAdminController_1.default.getDashboardStats(req, res);
        expect(getDashboardStatsByAdminService_1.default.getDashboardStatsByAdmin).toHaveBeenCalledWith(undefined, undefined);
    });
    it('responds with 500 and USER_FETCHING_ERROR when the service rejects', async () => {
        getDashboardStatsByAdminService_1.default.getDashboardStatsByAdmin.mockRejectedValue({ success: false });
        await getDashboardStatsByAdminController_1.default.getDashboardStats(req, res);
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: commonErrorMessages_1.COMMON_ERRORS.USER_FETCHING_ERROR });
    });
});
