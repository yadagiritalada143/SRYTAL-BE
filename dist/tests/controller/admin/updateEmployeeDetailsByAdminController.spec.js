"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateEmployeeDetailsByAdminController_1 = __importDefault(require("../../../controllers/admin/updateEmployeeDetailsByAdminController"));
const updateEmployeeDetailsByAdminService_1 = __importDefault(require("../../../services/admin/updateEmployeeDetailsByAdminService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateEmployeeDetailsByAdminService', () => ({
    __esModule: true,
    default: {
        updateEmployeeProfileByAdmin: jest.fn(),
    },
}));
describe('updateEmployeeDetailsByAdminController', () => {
    let req;
    let res;
    beforeEach(() => {
        req = { body: { email: 'a@x.com', firstName: 'John' } };
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
    it('responds with 200 and the update response on success', async () => {
        const response = { success: true };
        updateEmployeeDetailsByAdminService_1.default.updateEmployeeProfileByAdmin.mockResolvedValue(response);
        await updateEmployeeDetailsByAdminController_1.default.updateProfile(req, res);
        expect(updateEmployeeDetailsByAdminService_1.default.updateEmployeeProfileByAdmin).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(res.json).toHaveBeenCalledWith(response);
    });
    it('responds with 500 and USER_UPDATING_ERROR when the service throws', async () => {
        updateEmployeeDetailsByAdminService_1.default.updateEmployeeProfileByAdmin.mockRejectedValue(new Error('update failed'));
        await updateEmployeeDetailsByAdminController_1.default.updateProfile(req, res);
        expect(console.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: commonErrorMessages_1.COMMON_ERRORS.USER_UPDATING_ERROR });
    });
});
