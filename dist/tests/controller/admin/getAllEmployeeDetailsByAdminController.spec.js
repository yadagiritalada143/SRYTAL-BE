"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmployeeDetailsByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllEmployeeDetailsByAdminController"));
const getAllEmployeeDetailsByAdminService_1 = __importDefault(require("../../../services/admin/getAllEmployeeDetailsByAdminService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getAllEmployeeDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        getAllEmployeeDetailsByAdmin: jest.fn(),
    },
}));
describe('getAllEmployeeDetailsByAdminController', () => {
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
    it('responds with 200 and the employee details on success', async () => {
        const response = { success: true, usersList: [] };
        getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin.mockResolvedValue(response);
        await getAllEmployeeDetailsByAdminController_1.default.getAllEmployeeDetails(req, res);
        expect(getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin).toHaveBeenCalledWith('org1', 'adminId');
        expect(res.status).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('passes undefined org/user when req.user is missing', async () => {
        req.user = undefined;
        getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin.mockResolvedValue({ success: true });
        await getAllEmployeeDetailsByAdminController_1.default.getAllEmployeeDetails(req, res);
        expect(getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin).toHaveBeenCalledWith(undefined, undefined);
    });
    it('responds with 500 and USER_FETCHING_ERROR when the service rejects', async () => {
        getAllEmployeeDetailsByAdminService_1.default.getAllEmployeeDetailsByAdmin.mockRejectedValue({ success: false });
        await getAllEmployeeDetailsByAdminController_1.default.getAllEmployeeDetails(req, res);
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: commonErrorMessages_1.COMMON_ERRORS.USER_FETCHING_ERROR });
    });
});
