"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manageRecruiterController_1 = __importDefault(require("../../../controllers/recruiter/manageRecruiterController"));
const manageRecruiterService_1 = __importDefault(require("../../../services/recruiter/manageRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/manageRecruiterService', () => ({
    __esModule: true,
    default: {
        getPoolCompanyDetails: jest.fn(),
        getPoolCompanyDetailsById: jest.fn(),
        addPoolCompany: jest.fn()
    }
}));
const getPoolCompanyDetailsMock = manageRecruiterService_1.default.getPoolCompanyDetails;
const getPoolCompanyDetailsByIdMock = manageRecruiterService_1.default.getPoolCompanyDetailsById;
const addPoolCompanyMock = manageRecruiterService_1.default.addPoolCompany;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('manageRecruiterController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getPoolCompanyDetailsMock.mockReset();
        getPoolCompanyDetailsByIdMock.mockReset();
        addPoolCompanyMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('getPoolCompanyDetails', () => {
        it('returns 200 with the pool companies response', async () => {
            const poolCompaniesResponse = {
                success: true,
                poolCompaniesResponse: [{ id: 'c1', companyName: 'Acme' }]
            };
            getPoolCompanyDetailsMock.mockResolvedValue(poolCompaniesResponse);
            await manageRecruiterController_1.default.getPoolCompanyDetails({}, res);
            await flushMicrotasks();
            expect(getPoolCompanyDetailsMock).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith(poolCompaniesResponse);
        });
        it('returns 500 with the error message when the service rejects', async () => {
            getPoolCompanyDetailsMock.mockRejectedValue(new Error('Service failure'));
            await manageRecruiterController_1.default.getPoolCompanyDetails({}, res);
            await flushMicrotasks();
            expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_COMPANY_DETAILS
            });
        });
    });
    describe('getPoolCompanyDetailsById', () => {
        it('returns 200 with the pool company details when found', async () => {
            const poolCompanyDetails = { _id: 'c1', companyName: 'Acme' };
            getPoolCompanyDetailsByIdMock.mockResolvedValue(poolCompanyDetails);
            const req = { params: { id: 'c1' } };
            await manageRecruiterController_1.default.getPoolCompanyDetailsById(req, res);
            await flushMicrotasks();
            expect(getPoolCompanyDetailsByIdMock).toHaveBeenCalledWith('c1');
            expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({ success: true, poolCompanyResponse: poolCompanyDetails });
        });
        it('returns 500 with the error message when the service rejects', async () => {
            getPoolCompanyDetailsByIdMock.mockRejectedValue(new Error('Service failure'));
            const req = { params: { id: 'c1' } };
            await manageRecruiterController_1.default.getPoolCompanyDetailsById(req, res);
            await flushMicrotasks();
            expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_COMPANY_DETAILS
            });
        });
    });
    describe('addPoolCompany', () => {
        it('adds a pool company successfully and returns 200 with a success flag', async () => {
            const req = { body: { companyName: 'Acme' } };
            addPoolCompanyMock.mockResolvedValue(undefined);
            await manageRecruiterController_1.default.addPoolCompany(req, res);
            await flushMicrotasks();
            expect(addPoolCompanyMock).toHaveBeenCalledTimes(1);
            expect(addPoolCompanyMock).toHaveBeenCalledWith({ companyName: 'Acme' });
            expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({ success: true });
        });
        it('returns 500 with the error message when the service throws', async () => {
            const req = { body: { companyName: 'Acme' } };
            addPoolCompanyMock.mockRejectedValue(new Error('Service failure'));
            await manageRecruiterController_1.default.addPoolCompany(req, res);
            await flushMicrotasks();
            expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_COMPANY_DETAILS
            });
        });
    });
});
