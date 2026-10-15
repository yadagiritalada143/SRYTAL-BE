"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCompanyByRecruiterController_1 = __importDefault(require("../../../controllers/recruiter/updateCompanyByRecruiterController"));
const updateCompanyByRecruiterService_1 = __importDefault(require("../../../services/recruiter/updateCompanyByRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/updateCompanyByRecruiterService', () => ({
    __esModule: true,
    default: { updatePoolCompanyDetails: jest.fn() }
}));
const updatePoolCompanyDetailsMock = updateCompanyByRecruiterService_1.default.updatePoolCompanyDetails;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updateCompanyByRecruiterController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updatePoolCompanyDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates the pool company successfully and returns 200 with a success flag', async () => {
        const req = { body: { id: 'c1', companyName: 'Acme' } };
        updatePoolCompanyDetailsMock.mockResolvedValue({ success: true });
        await updateCompanyByRecruiterController_1.default.updateCompanyByRecruiter(req, res);
        await flushMicrotasks();
        expect(updatePoolCompanyDetailsMock).toHaveBeenCalledWith({ id: 'c1', companyName: 'Acme' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 401 with the error message when the update is not successful', async () => {
        const req = { body: { id: 'c1', companyName: 'Acme' } };
        updatePoolCompanyDetailsMock.mockResolvedValue({ success: false });
        await updateCompanyByRecruiterController_1.default.updateCompanyByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { id: 'c1', companyName: 'Acme' } };
        updatePoolCompanyDetailsMock.mockRejectedValue(new Error('Service failure'));
        await updateCompanyByRecruiterController_1.default.updateCompanyByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS
        });
    });
});
