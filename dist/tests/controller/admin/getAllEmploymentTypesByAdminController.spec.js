"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmploymentTypesByAdminController_1 = __importDefault(require("../../../controllers/admin/getAllEmploymentTypesByAdminController"));
const getAllEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/getAllEmploymentTypeByAdminService"));
const employementTypesMessages_1 = require("../../../constants/admin/employementTypesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getAllEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        getAllEmploymentTypesByAdmin: jest.fn()
    }
}));
const getAllEmploymentTypesByAdminServiceMock = getAllEmploymentTypeByAdminService_1.default.getAllEmploymentTypesByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getAllEmploymentTypesByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllEmploymentTypesByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the fetched employment types response when the service resolves', async () => {
        const req = {};
        const fetchResponse = { success: true, employmentTypesList: [{ _id: 'et1', employmentType: 'Full-Time' }] };
        getAllEmploymentTypesByAdminServiceMock.mockResolvedValue(fetchResponse);
        await getAllEmploymentTypesByAdminController_1.default.getAllEmploymentTypesByAdmin(req, res);
        await flushMicrotasks();
        expect(getAllEmploymentTypesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        const req = {};
        getAllEmploymentTypesByAdminServiceMock.mockRejectedValue({ success: false });
        await getAllEmploymentTypesByAdminController_1.default.getAllEmploymentTypesByAdmin(req, res);
        await flushMicrotasks();
        expect(getAllEmploymentTypesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_FETCH_ERROR_MESSAGES
        });
    });
});
