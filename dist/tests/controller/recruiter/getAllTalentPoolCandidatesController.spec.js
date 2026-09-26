"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllTalentPoolCandidatesController_1 = __importDefault(require("../../../controllers/recruiter/getAllTalentPoolCandidatesController"));
const getAllTalentPoolCandidatesByRecruiterService_1 = __importDefault(require("../../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService', () => ({
    __esModule: true,
    default: { getAllTalentPoolCandidates: jest.fn() }
}));
const getAllTalentPoolCandidatesMock = getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getAllTalentPoolCandidatesController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllTalentPoolCandidatesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the talent pool candidates list', async () => {
        const candidatesList = { success: true, talentPoolCandidatesList: [{ _id: 't1', candidateName: 'Alice' }] };
        getAllTalentPoolCandidatesMock.mockResolvedValue(candidatesList);
        await getAllTalentPoolCandidatesController_1.default.getAllTalentPoolCandidatesByRecruiter({}, res);
        await flushMicrotasks();
        expect(getAllTalentPoolCandidatesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(candidatesList);
    });
    it('returns 500 with the error message when the service rejects', async () => {
        getAllTalentPoolCandidatesMock.mockRejectedValue(new Error('Service failure'));
        await getAllTalentPoolCandidatesController_1.default.getAllTalentPoolCandidatesByRecruiter({}, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS
        });
    });
});
