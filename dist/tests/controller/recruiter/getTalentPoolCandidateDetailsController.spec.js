"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getTalentPoolCandidateDetailsController_1 = __importDefault(require("../../../controllers/recruiter/getTalentPoolCandidateDetailsController"));
const getTalentPoolCandidateByIdService_1 = __importDefault(require("../../../services/recruiter/getTalentPoolCandidateByIdService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/getTalentPoolCandidateByIdService', () => ({
    __esModule: true,
    default: { getTalentPoolCandidateDetails: jest.fn() }
}));
const getTalentPoolCandidateDetailsMock = getTalentPoolCandidateByIdService_1.default.getTalentPoolCandidateDetails;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getTalentPoolCandidateDetailsController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getTalentPoolCandidateDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the talent pool candidate details', async () => {
        const candidateDetails = { success: true, talentPoolCandidateDetails: { _id: 't1', candidateName: 'Alice' } };
        getTalentPoolCandidateDetailsMock.mockResolvedValue(candidateDetails);
        const req = { params: { id: 't1' } };
        await getTalentPoolCandidateDetailsController_1.default.getTalentPoolCandidateDetailsByRecruiter(req, res);
        await flushMicrotasks();
        expect(getTalentPoolCandidateDetailsMock).toHaveBeenCalledWith('t1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(candidateDetails);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        getTalentPoolCandidateDetailsMock.mockRejectedValue(new Error('Service failure'));
        const req = { params: { id: 't1' } };
        await getTalentPoolCandidateDetailsController_1.default.getTalentPoolCandidateDetailsByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS
        });
    });
});
