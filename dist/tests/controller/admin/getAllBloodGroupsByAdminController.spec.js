"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllBloodGroupsByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllBloodGroupsByAdminController"));
const getAllBloodGroupsByAdminService_1 = __importDefault(require("../../../services/admin/getAllBloodGroupsByAdminService"));
const bloodgroupMessages_1 = require("../../../constants/admin/bloodgroupMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getAllBloodGroupsByAdminService', () => ({
    __esModule: true,
    default: {
        getAllBloodgroupsByAdmin: jest.fn()
    }
}));
const getAllBloodgroupsByAdminServiceMock = getAllBloodGroupsByAdminService_1.default.getAllBloodgroupsByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getAllBloodGroupsDetails controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllBloodgroupsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the fetched blood group response when the service resolves', async () => {
        const req = {};
        const fetchResponse = { success: true, bloodGroupList: [{ _id: 'bg1', type: 'O+' }] };
        getAllBloodgroupsByAdminServiceMock.mockResolvedValue(fetchResponse);
        await getAllBloodGroupsByAdminController_1.default.getAllBloodGroupsDetails(req, res);
        await flushMicrotasks();
        expect(getAllBloodgroupsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {};
        getAllBloodgroupsByAdminServiceMock.mockRejectedValue({ success: false });
        await getAllBloodGroupsByAdminController_1.default.getAllBloodGroupsDetails(req, res);
        await flushMicrotasks();
        expect(getAllBloodgroupsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: bloodgroupMessages_1.BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_FETCH_ERROR_MESSAGES
        });
    });
});
