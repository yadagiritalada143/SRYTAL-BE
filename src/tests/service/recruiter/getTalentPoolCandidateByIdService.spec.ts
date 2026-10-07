import getTalentPoolCandidateDetailsService from '../../../services/recruiter/getTalentPoolCandidateByIdService';
import TalentPoolCandidatesModel from '../../../model/talentPoolCandidatesModel';

jest.mock('../../../model/talentPoolCandidatesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const findByIdMock = (TalentPoolCandidatesModel as unknown as { findById: jest.Mock }).findById;

const buildChain = (data: any, error?: Error) => {
    const chain: any = {};
    chain.populate = () => chain;
    chain.then = (onFulfilled: any) => {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(data).then(onFulfilled);
    };
    return chain;
};

describe('getTalentPoolCandidateByIdService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves with candidate details when comments are converted to timestamps and sorted', async () => {
        const candidate = {
            _id: 't1',
            candidateName: 'Alice',
            comments: [
                { userId: 'u1', comment: 'old', updateAt: new Date('2024-01-01T00:00:00Z') },
                { userId: 'u2', comment: 'new', updateAt: new Date('2024-02-01T00:00:00Z') }
            ]
        };
        findByIdMock.mockReturnValue(buildChain(candidate));

        const result = await getTalentPoolCandidateDetailsService.getTalentPoolCandidateDetails('t1');

        expect(findByIdMock).toHaveBeenCalledWith({ _id: 't1' });
        expect(result).toEqual({
            success: true,
            talentPoolCandidateDetails: {
                _id: 't1',
                candidateName: 'Alice',
                comments: [
                    { userId: 'u2', comment: 'new', updateAt: new Date('2024-02-01T00:00:00Z').getTime() },
                    { userId: 'u1', comment: 'old', updateAt: new Date('2024-01-01T00:00:00Z').getTime() }
                ]
            }
        });
    });

    it('falls back to 0 for invalid comment timestamps', async () => {
        const candidate = {
            _id: 't1',
            candidateName: 'Alice',
            comments: [{ userId: 'u1', comment: 'bad date', updateAt: 'not-a-date' }]
        };
        findByIdMock.mockReturnValue(buildChain(candidate));

        const result = await getTalentPoolCandidateDetailsService.getTalentPoolCandidateDetails('t1');

        expect(result).toEqual({
            success: true,
            talentPoolCandidateDetails: {
                _id: 't1',
                candidateName: 'Alice',
                comments: [{ userId: 'u1', comment: 'bad date', updateAt: 0 }]
            }
        });
    });

    it('resolves with candidate details unchanged when comments is not an array', async () => {
        const candidate = { _id: 't1', candidateName: 'Alice', comments: 'none' };
        findByIdMock.mockReturnValue(buildChain(candidate));

        const result = await getTalentPoolCandidateDetailsService.getTalentPoolCandidateDetails('t1');

        expect(result).toEqual({ success: true, talentPoolCandidateDetails: candidate });
    });

    it('rejects with { success: false } when the candidate does not exist', async () => {
        findByIdMock.mockReturnValue(buildChain(null));

        await expect(getTalentPoolCandidateDetailsService.getTalentPoolCandidateDetails('t1')).rejects.toEqual({
            success: false
        });
    });

    it('rejects with { success: false } when the query throws', async () => {
        findByIdMock.mockReturnValue(buildChain(undefined, new Error('Database down')));

        await expect(getTalentPoolCandidateDetailsService.getTalentPoolCandidateDetails('t1')).rejects.toEqual({
            success: false
        });
    });
});