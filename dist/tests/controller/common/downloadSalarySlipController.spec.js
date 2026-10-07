"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const downloadSalarySlipController_1 = __importDefault(require("../../../controllers/common/downloadSalarySlipController"));
const downloadSalarySlipService_1 = __importDefault(require("../../../services/common/downloadSalarySlipService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const employeeSalarySlipMessage_1 = require("../../../constants/common/employeeSalarySlipMessage");
jest.mock('../../../services/common/downloadSalarySlipService', () => ({
    __esModule: true,
    default: { downloadSalarySlip: jest.fn() }
}));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
const downloadSalarySlipMock = downloadSalarySlipService_1.default.downloadSalarySlip;
const findByIdMock = userModel_1.default.findById;
describe('downloadSalarySlipController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        downloadSalarySlipMock.mockReset();
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ mongoId: 'u1', fullName: 'John Doe', month: 'Feb', year: '2026' }, overrides),
        user: { userId: 'u1' }
    });
    const mockCurrentUser = (user) => {
        findByIdMock.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    };
    it('returns 400 when required parameters are missing', async () => {
        const req = buildReq({ mongoId: undefined });
        await downloadSalarySlipController_1.default.downloadSalarySlip(req, res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.INVALID_REQUEST_PARAMS
        });
    });
    it('returns 200 for an employee downloading their own slip', async () => {
        downloadSalarySlipMock.mockResolvedValue({
            success: true,
            downloadUrl: 'https://signed-url/slip.pdf',
            fileName: 'John-Doe-Feb-2026.pdf'
        });
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq(), res);
        expect(findByIdMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED,
            data: {
                downloadUrl: 'https://signed-url/slip.pdf',
                fileName: 'John-Doe-Feb-2026.pdf'
            }
        });
    });
    it('returns 200 when an admin downloads another employee slip', async () => {
        mockCurrentUser({ userRole: 'admin' });
        downloadSalarySlipMock.mockResolvedValue({ success: true, downloadUrl: 'url', fileName: 'f.pdf' });
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);
        expect(findByIdMock).toHaveBeenCalledWith('u1');
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.OK);
    });
    it('returns 403 when a non-admin downloads another employee slip', async () => {
        mockCurrentUser({ userRole: 'employee' });
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        });
    });
    it('returns 403 when the current user cannot be found', async () => {
        mockCurrentUser(null);
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.FORBIDDEN);
    });
    it('returns 403 when the current user has no role', async () => {
        mockCurrentUser({ userRole: undefined });
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.FORBIDDEN);
    });
    it('checks the role when the request has no user and treats it as forbidden', async () => {
        const req = {
            body: { mongoId: 'u1', fullName: 'John Doe', month: 'Feb', year: '2026' },
            user: undefined
        };
        mockCurrentUser(null);
        await downloadSalarySlipController_1.default.downloadSalarySlip(req, res);
        expect(findByIdMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.FORBIDDEN);
    });
    it('returns 404 when the slip does not exist', async () => {
        downloadSalarySlipMock.mockResolvedValue({ success: false, error: 'SALARY_SLIP_NOT_FOUND' });
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq(), res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_NOT_FOUND
        });
    });
    it('returns 500 for an unknown service failure', async () => {
        downloadSalarySlipMock.mockResolvedValue({ success: false, error: 'OTHER' });
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq(), res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR
        });
    });
    it('returns 500 when the service throws', async () => {
        downloadSalarySlipMock.mockRejectedValue(new Error('boom'));
        await downloadSalarySlipController_1.default.downloadSalarySlip(buildReq(), res);
        expect(mockStatus).toHaveBeenCalledWith(employeeSalarySlipMessage_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
});
