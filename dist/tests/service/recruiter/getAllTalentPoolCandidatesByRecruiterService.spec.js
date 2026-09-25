"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllTalentPoolCandidatesByRecruiterService_1 = __importDefault(require("../../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService"));
const talentPoolCandidatesModel_1 = __importDefault(require("../../../model/talentPoolCandidatesModel"));
jest.mock('../../../model/talentPoolCandidatesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
const findMock = talentPoolCandidatesModel_1.default.find;
const buildChain = (data, error) => {
    const chain = {};
    chain.populate = () => chain;
    chain.then = (onFulfilled) => {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(data).then(onFulfilled);
    };
    return chain;
};
describe('getAllTalentPoolCandidatesByRecruiterService', () => {
    beforeEach(() => {
        findMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('resolves with an empty list when there are no candidates', async () => {
        findMock.mockReturnValue(buildChain([]));
        const result = await getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates();
        expect(findMock).toHaveBeenCalledWith({});
        expect(result).toEqual({ success: true, talentPoolCandidatesList: [] });
    });
    it('resolves with candidates sorted by their latest comment in descending order', async () => {
        const candidateA = {
            _id: 'a',
            candidateName: 'Alice',
            comments: [
                { userId: 'u1', comment: 'first', updateAt: new Date('2024-01-10T00:00:00Z') },
                { userId: 'u1', comment: 'second', updateAt: new Date('2024-01-01T00:00:00Z') }
            ]
        };
        const candidateB = {
            _id: 'b',
            candidateName: 'Bob',
            comments: [{ userId: 'u2', comment: 'latest', updateAt: new Date('2024-02-01T00:00:00Z') }]
        };
        findMock.mockReturnValue(buildChain([candidateA, candidateB]));
        const result = await getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates();
        expect(result).toEqual({
            success: true,
            talentPoolCandidatesList: [
                {
                    _id: 'b',
                    candidateName: 'Bob',
                    comments: [{ userId: 'u2', comment: 'latest', updateAt: new Date('2024-02-01T00:00:00Z').getTime() }]
                },
                {
                    _id: 'a',
                    candidateName: 'Alice',
                    comments: [
                        { userId: 'u1', comment: 'first', updateAt: new Date('2024-01-10T00:00:00Z').getTime() },
                        { userId: 'u1', comment: 'second', updateAt: new Date('2024-01-01T00:00:00Z').getTime() }
                    ]
                }
            ]
        });
    });
    it('sorts candidates with comments ahead of candidates without comments', async () => {
        const candidateWithComments = {
            _id: 'a',
            candidateName: 'Alice',
            comments: [{ userId: 'u1', comment: 'recent', updateAt: new Date('2024-02-01T00:00:00Z') }]
        };
        const candidateWithoutComments = { _id: 'b', candidateName: 'Bob' };
        const candidateWithEmptyComments = { _id: 'c', candidateName: 'Charlie', comments: [] };
        findMock.mockReturnValue(buildChain([candidateWithEmptyComments, candidateWithoutComments, candidateWithComments]));
        const result = await getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates();
        expect(result).toEqual({
            success: true,
            talentPoolCandidatesList: [
                {
                    _id: 'a',
                    candidateName: 'Alice',
                    comments: [{ userId: 'u1', comment: 'recent', updateAt: new Date('2024-02-01T00:00:00Z').getTime() }]
                },
                { _id: 'c', candidateName: 'Charlie', comments: [] },
                { _id: 'b', candidateName: 'Bob' }
            ]
        });
    });
    it('falls back to 0 as the updateAt when a comment timestamp is invalid', async () => {
        const candidate = {
            _id: 'a',
            candidateName: 'Alice',
            comments: [{ userId: 'u1', comment: 'bad date', updateAt: 'not-a-date' }]
        };
        findMock.mockReturnValue(buildChain([candidate]));
        const result = await getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates();
        expect(result).toEqual({
            success: true,
            talentPoolCandidatesList: [
                Object.assign(Object.assign({}, candidate), { comments: [{ userId: 'u1', comment: 'bad date', updateAt: 0 }] })
            ]
        });
    });
    it('rejects with { success: false } when the find call returns no result', async () => {
        findMock.mockReturnValue(buildChain(null));
        await expect(getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates()).rejects.toEqual({
            success: false
        });
    });
    it('rejects with { success: false } when the find call throws', async () => {
        findMock.mockReturnValue(buildChain(undefined, new Error('Database down')));
        await expect(getAllTalentPoolCandidatesByRecruiterService_1.default.getAllTalentPoolCandidates()).rejects.toEqual({
            success: false
        });
    });
});
