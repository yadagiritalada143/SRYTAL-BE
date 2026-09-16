import manageRecruiterService from '../../../services/recruiter/manageRecruiterService';
import PoolCompaniesModel from '../../../model/poolCompanies';

jest.mock('../../../model/poolCompanies', () => {
    const PoolCompaniesModel = jest.fn();
    (PoolCompaniesModel as any).find = jest.fn();
    (PoolCompaniesModel as any).findOne = jest.fn();
    return { __esModule: true, default: PoolCompaniesModel };
});

const PoolCompaniesModelMock = PoolCompaniesModel as unknown as jest.Mock & {
    find: jest.Mock;
    findOne: jest.Mock;
};

const findMock = PoolCompaniesModelMock.find;
const findOneMock = PoolCompaniesModelMock.findOne;

const buildChain = (data: any, error?: Error) => {
    const chain: any = {};
    chain.then = (onFulfilled: any) => {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(data).then(onFulfilled);
    };
    return chain;
};

describe('manageRecruiterService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        PoolCompaniesModelMock.mockReset();
        findMock.mockReset();
        findOneMock.mockReset();
        saveSpy = jest.fn();
        PoolCompaniesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getPoolCompanyDetails', () => {
        it('resolves with the mapped pool companies list and a success flag', async () => {
            const poolCompanies = [
                {
                    _id: 'c1',
                    companyName: 'Acme',
                    primaryContact: { name: 'John' },
                    secondaryContact_1: { name: 'Jane' },
                    secondaryContact_2: { name: 'Jack' },
                    status: 'ACTIVE',
                    createdAt: new Date('2024-01-01T00:00:00Z'),
                    lastUpdatedAt: new Date('2024-01-02T00:00:00Z')
                }
            ];
            findMock.mockReturnValue(buildChain(poolCompanies));

            const result = await manageRecruiterService.getPoolCompanyDetails();

            expect(findMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                success: true,
                poolCompaniesResponse: [
                    {
                        id: 'c1',
                        companyName: 'Acme',
                        primaryContact: { name: 'John' },
                        secondaryContact_1: { name: 'Jane' },
                        secondaryContact_2: { name: 'Jack' },
                        status: 'ACTIVE',
                        createdAt: poolCompanies[0].createdAt,
                        lastUpdatedAt: poolCompanies[0].lastUpdatedAt
                    }
                ]
            });
        });

        it('rejects with { success: false } when the find call returns no result', async () => {
            findMock.mockReturnValue(buildChain(null));

            await expect(manageRecruiterService.getPoolCompanyDetails()).rejects.toEqual({ success: false });
        });

        it('rejects with { success: false } when the find call throws', async () => {
            findMock.mockReturnValue(buildChain(undefined, new Error('Database down')));

            await expect(manageRecruiterService.getPoolCompanyDetails()).rejects.toEqual({ success: false });
        });
    });

    describe('getPoolCompanyDetailsById', () => {
        it('returns the company details with comments sorted in descending order', async () => {
            const companyDetails = {
                _id: 'c1',
                companyName: 'Acme',
                comments: [
                    { userId: 'u1', comment: 'first', updateAt: new Date('2024-01-02T00:00:00Z') },
                    { userId: 'u2', comment: 'second', updateAt: new Date('2024-01-03T00:00:00Z') }
                ]
            };
            const populateMock = jest.fn().mockReturnValue(companyDetails);
            findOneMock.mockReturnValue({ populate: populateMock });

            const result: any = await manageRecruiterService.getPoolCompanyDetailsById('c1');

            expect(findOneMock).toHaveBeenCalledWith({ _id: 'c1' });
            expect(populateMock).toHaveBeenCalledWith('comments.userId', 'firstName lastName');
            expect(result).toEqual(companyDetails);
            expect(result.comments[0].updateAt.getTime()).toBeGreaterThan(result.comments[1].updateAt.getTime());
        });

        it('returns the company details as is when there are no comments', async () => {
            const companyDetails = { _id: 'c1', companyName: 'Acme' };
            const populateMock = jest.fn().mockReturnValue(companyDetails);
            findOneMock.mockReturnValue({ populate: populateMock });

            const result: any = await manageRecruiterService.getPoolCompanyDetailsById('c1');

            expect(result).toEqual(companyDetails);
        });

        it('rejects when the populate call throws', async () => {
            findOneMock.mockReturnValue({
                populate: jest.fn().mockImplementation(() => {
                    throw new Error('Populate failed');
                })
            });

            await expect(manageRecruiterService.getPoolCompanyDetailsById('c1')).rejects.toThrow('Populate failed');
        });
    });

    describe('addPoolCompany', () => {
        it('creates a pool company document with timestamps and saves it successfully', async () => {
            const savedCompany = { _id: 'c1', companyName: 'Acme' };
            saveSpy.mockResolvedValue(savedCompany);

            const result = await manageRecruiterService.addPoolCompany({
                companyName: 'Acme'
            } as any);

            expect(PoolCompaniesModelMock).toHaveBeenCalledTimes(1);
            expect(PoolCompaniesModelMock).toHaveBeenCalledWith({
                companyName: 'Acme',
                createdAt: expect.any(Date),
                lastUpdatedAt: expect.any(Date)
            });
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(savedCompany);
        });

        it('rejects when the save fails', async () => {
            saveSpy.mockRejectedValue(new Error('Database save failed'));

            await expect(manageRecruiterService.addPoolCompany({ companyName: 'Acme' } as any)).rejects.toThrow(
                'Database save failed'
            );
            expect(PoolCompaniesModelMock).toHaveBeenCalledTimes(1);
            expect(saveSpy).toHaveBeenCalledTimes(1);
        });
    });
});