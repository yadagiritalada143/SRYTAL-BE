"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updatePoolCandidateByRecruiterController_1 = __importDefault(require("../../../controllers/recruiter/updatePoolCandidateByRecruiterController"));
const updatePoolCandidateByRecruiterService_1 = __importDefault(require("../../../services/recruiter/updatePoolCandidateByRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/updatePoolCandidateByRecruiterService', () => ({
    __esModule: true,
    default: { updatePoolCandidateDetails: jest.fn() }
}));
const updatePoolCandidateDetailsMock = updatePoolCandidateByRecruiterService_1.default.updatePoolCandidateDetails;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('updatePoolCandidateByRecruiterController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updatePoolCandidateDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates the pool candidate successfully and returns 200 with a success flag', async () => {
        const req = { body: { id: 't1', candidateName: 'Alice' } };
        updatePoolCandidateDetailsMock.mockResolvedValue({ success: true });
        await updatePoolCandidateByRecruiterController_1.default.updatePoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(updatePoolCandidateDetailsMock).toHaveBeenCalledWith({ id: 't1', candidateName: 'Alice' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 401 with the error message when the update is not successful', async () => {
        const req = { body: { id: 't1', candidateName: 'Alice' } };
        updatePoolCandidateDetailsMock.mockResolvedValue({ success: false });
        await updatePoolCandidateByRecruiterController_1.default.updatePoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { id: 't1', candidateName: 'Alice' } };
        updatePoolCandidateDetailsMock.mockRejectedValue(new Error('Service failure'));
        await updatePoolCandidateByRecruiterController_1.default.updatePoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS
        });
    });
});
