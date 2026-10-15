"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCommentToPoolCandidateByRecruiterController_1 = __importDefault(require("../../../controllers/recruiter/addCommentToPoolCandidateByRecruiterController"));
const addCommentToPoolCandidateByRecruiterService_1 = __importDefault(require("../../../services/recruiter/addCommentToPoolCandidateByRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/addCommentToPoolCandidateByRecruiterService', () => ({
    __esModule: true,
    default: { addCommentToPoolCandidateByRecruiter: jest.fn() }
}));
const addCommentToPoolCandidateMock = addCommentToPoolCandidateByRecruiterService_1.default.addCommentToPoolCandidateByRecruiter;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addCommentToPoolCandidateByRecruiterController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addCommentToPoolCandidateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('adds a comment to the pool candidate and returns 200 with the response', async () => {
        const req = {
            body: { id: 't1', comment: 'Scheduled' },
            user: { userId: 'u1' }
        };
        const responseAfterCommentAdded = { _id: 't1', comments: [] };
        addCommentToPoolCandidateMock.mockResolvedValue(responseAfterCommentAdded);
        await addCommentToPoolCandidateByRecruiterController_1.default.addCommentToPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addCommentToPoolCandidateMock).toHaveBeenCalledWith({ id: 't1', comment: 'Scheduled', userId: 'u1' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCommentAdded });
    });
    it('passes undefined as the userId when the request has no user', async () => {
        const req = { body: { id: 't1', comment: 'Scheduled' } };
        addCommentToPoolCandidateMock.mockResolvedValue({ _id: 't1', comments: [] });
        await addCommentToPoolCandidateByRecruiterController_1.default.addCommentToPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(addCommentToPoolCandidateMock).toHaveBeenCalledWith({
            id: 't1',
            comment: 'Scheduled',
            userId: undefined
        });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { id: 't1', comment: 'Scheduled' },
            user: { userId: 'u1' }
        };
        addCommentToPoolCandidateMock.mockRejectedValue(new Error('Service failure'));
        await addCommentToPoolCandidateByRecruiterController_1.default.addCommentToPoolCandidateByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT_TO_POOL_CANDIDATE
        });
    });
});
