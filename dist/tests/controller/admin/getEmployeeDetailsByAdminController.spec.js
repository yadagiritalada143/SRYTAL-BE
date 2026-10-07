"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getEmployeeDetailsByAdminController_1 = __importDefault(require("../../../controllers/admin/getEmployeeDetailsByAdminController"));
const getUserDetailsByAdminService_1 = __importDefault(require("../../../services/admin/getUserDetailsByAdminService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getUserDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        getEmployeeDetailsByAdmin: jest.fn(),
    },
}));
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getEmployeeDetailsByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { params: { id: 'u1' } };
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
    it('responds with 200 and the fetched user details on success', async () => {
        const response = { success: true, userDetails: { id: 'u1' } };
        getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin.mockResolvedValue(response);
        getEmployeeDetailsByAdminController_1.default.getUserDetails(req, res);
        await flushMicrotasks();
        expect(getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin).toHaveBeenCalledWith('u1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('responds with 500 and USER_FETCHING_ERROR when the service rejects', async () => {
        getUserDetailsByAdminService_1.default.getEmployeeDetailsByAdmin.mockRejectedValue({ success: false });
        getEmployeeDetailsByAdminController_1.default.getUserDetails(req, res);
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: commonErrorMessages_1.COMMON_ERRORS.USER_FETCHING_ERROR });
    });
});
