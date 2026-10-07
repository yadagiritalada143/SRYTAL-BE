"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllEmployeesBySuperadminController_1 = __importDefault(require("../../../controllers/superadmin/getAllEmployeesBySuperadminController"));
const getAllEmployeesBySuperadminService_1 = __importDefault(require("../../../services/superadmin/getAllEmployeesBySuperadminService"));
const superadminErrorMessage_1 = require("../../../constants/superadmin/superadminErrorMessage");
jest.mock('../../../services/superadmin/getAllEmployeesBySuperadminService', () => ({
    __esModule: true,
    default: {
        getAllEmployeesBySuperadmin: jest.fn()
    }
}));
const getAllEmployeesBySuperadminMock = getAllEmployeesBySuperadminService_1.default.getAllEmployeesBySuperadmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getAllEmployeesBySuperadminController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = {
            status: mockStatus,
            json: mockJson
        };
        getAllEmployeesBySuperadminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('getAllEmployeesBySuperadmin', () => {
        it('returns 200 with employee list on success', async () => {
            const req = { params: { organizationId: 'org1' } };
            const employees = {
                success: true,
                superadminEmployeeList: [
                    { _id: 'u1', firstName: 'John', lastName: 'Doe' }
                ]
            };
            getAllEmployeesBySuperadminMock.mockResolvedValue(employees);
            await getAllEmployeesBySuperadminController_1.default.getAllEmployeesBySuperadmin(req, res);
            await flushMicrotasks();
            expect(getAllEmployeesBySuperadminMock).toHaveBeenCalledWith('org1');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(employees);
        });
        it('returns 500 when the service throws', async () => {
            const req = { params: { organizationId: 'org1' } };
            getAllEmployeesBySuperadminMock.mockRejectedValue({ success: false });
            await getAllEmployeesBySuperadminController_1.default.getAllEmployeesBySuperadmin(req, res);
            await flushMicrotasks();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: superadminErrorMessage_1.SUPERADMIN_ERROR.FETCHING_ALL_EMPLOYEE_DETAILS_ERROR
            });
        });
    });
});
