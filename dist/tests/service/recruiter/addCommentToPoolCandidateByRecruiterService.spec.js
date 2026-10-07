"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCommentToPoolCandidateByRecruiterService_1 = __importDefault(require("../../../services/recruiter/addCommentToPoolCandidateByRecruiterService"));
const talentPoolCandidatesModel_1 = __importDefault(require("../../../model/talentPoolCandidatesModel"));
jest.mock('../../../model/talentPoolCandidatesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));
const findByIdAndUpdateMock = talentPoolCandidatesModel_1.default
    .findByIdAndUpdate;
describe('addCommentToPoolCandidateByRecruiterService', () => {
    beforeEach(() => {
        findByIdAndUpdateMock.mockReset();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('pushes the comment onto the candidate and returns the updated document', async () => {
        const updatedCandidate = {
            _id: 't1',
            candidateName: 'Alice',
            comments: [{ userId: 'u1', comment: 'Scheduled', callStartsAt: new Date(), callEndsAt: new Date() }]
        };
        findByIdAndUpdateMock.mockResolvedValue(updatedCandidate);
        const result = await addCommentToPoolCandidateByRecruiterService_1.default.addCommentToPoolCandidateByRecruiter({
            id: 't1',
            comment: 'Scheduled',
            callStartsAt: '2024-01-01T10:00:00Z',
            callEndsAt: '2024-01-01T10:30:00Z',
            userId: 'u1'
        });
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith('t1', {
            lastUpdatedAt: expect.any(Date),
            $push: {
                comments: {
                    comment: 'Scheduled',
                    userId: 'u1',
                    callStartsAt: '2024-01-01T10:00:00Z',
                    callEndsAt: '2024-01-01T10:30:00Z',
                    updateAt: expect.any(Date)
                }
            }
        }, {
            new: true,
            populate: {
                path: 'comments.userId',
                select: 'firstName lastName'
            }
        });
        expect(result).toEqual(updatedCandidate);
    });
    it('rejects when the update throws', async () => {
        findByIdAndUpdateMock.mockRejectedValue(new Error('Update failed'));
        await expect(addCommentToPoolCandidateByRecruiterService_1.default.addCommentToPoolCandidateByRecruiter({
            id: 't1',
            comment: 'Scheduled',
            userId: 'u1'
        })).rejects.toThrow('Update failed');
    });
});
