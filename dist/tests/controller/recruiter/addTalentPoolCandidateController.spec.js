"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addTalentPoolCandidateController_1 = __importDefault(require("../../../controllers/recruiter/addTalentPoolCandidateController"));
const addTalentPoolCandidateByRecruiterService_1 = __importDefault(require("../../../services/recruiter/addTalentPoolCandidateByRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/addTalentPoolCandidateByRecruiterService', () => ({
    __esModule: true,
    default: { addTalentPoolCandidatesByRecruiter: jest.fn() }
}));
const addTalentPoolCandidatesMock = addTalentPoolCandidateByRecruiterService_1.default.addTalentPoolCandidatesByRecruiter;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addTalentPoolCandidateController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addTalentPoolCandidatesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('adds a candidate without comments and returns 200 with the added candidate response', async () => {
        const req = {
            body: { candidateName: 'Alice' },
            user: { userId: 'u1' }
        };
        const addedCandidate = { _id: 't1', candidateName: 'Alice' };
        addTalentPoolCandidatesMock.mockResolvedValue(addedCandidate);
        await addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(expect.objectContaining({
            candidateName: 'Alice',
            createdAt: expect.any(Date),
            lastUpdatedAt: expect.any(Date),
            createdBy: 'u1'
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCandidateAdded: addedCandidate });
    });
    it('adds a candidate with comments mapped to the current user and returns 200', async () => {
        const req = {
            body: { candidateName: 'Alice', comments: [{ comment: 'Initial review' }] },
            user: { userId: 'u1' }
        };
        addTalentPoolCandidatesMock.mockResolvedValue({ _id: 't1' });
        await addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(expect.objectContaining({
            candidateName: 'Alice',
            createdAt: expect.any(Date),
            lastUpdatedAt: expect.any(Date),
            createdBy: 'u1',
            comments: [{ comment: 'Initial review', userId: 'u1', updatedAt: expect.any(Date) }]
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCandidateAdded: { _id: 't1' } });
    });
    it('adds a candidate with an empty comments array without remapping the comments', async () => {
        const req = {
            body: { candidateName: 'Alice', comments: [] },
            user: { userId: 'u1' }
        };
        addTalentPoolCandidatesMock.mockResolvedValue({ _id: 't1' });
        await addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(expect.objectContaining({
            candidateName: 'Alice',
            createdBy: 'u1',
            comments: []
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('leaves createdBy undefined when the request has no user', async () => {
        const req = { body: { candidateName: 'Alice' } };
        addTalentPoolCandidatesMock.mockResolvedValue({ _id: 't1' });
        await addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addTalentPoolCandidatesMock).toHaveBeenCalledWith(expect.objectContaining({
            candidateName: 'Alice',
            createdBy: undefined
        }));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCandidateAdded: { _id: 't1' } });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { candidateName: 'Alice' },
            user: { userId: 'u1' }
        };
        addTalentPoolCandidatesMock.mockRejectedValue(new Error('Service failure'));
        await addTalentPoolCandidateController_1.default.addTalentPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addTalentPoolCandidatesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_CANDIDATE_DETAILS
        });
    });
});
