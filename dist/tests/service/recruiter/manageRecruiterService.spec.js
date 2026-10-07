"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manageRecruiterService_1 = __importDefault(require("../../../services/recruiter/manageRecruiterService"));
const poolCompanies_1 = __importDefault(require("../../../model/poolCompanies"));
jest.mock('../../../model/poolCompanies', () => {
    const PoolCompaniesModel = jest.fn();
    PoolCompaniesModel.find = jest.fn();
    PoolCompaniesModel.findOne = jest.fn();
    return { __esModule: true, default: PoolCompaniesModel };
});
const PoolCompaniesModelMock = poolCompanies_1.default;
const findMock = PoolCompaniesModelMock.find;
const findOneMock = PoolCompaniesModelMock.findOne;
const buildChain = (data, error) => {
    const chain = {};
    chain.then = (onFulfilled) => {
        if (error) {
            return Promise.reject(error);
        }
        return Promise.resolve(data).then(onFulfilled);
    };
    return chain;
};
describe('manageRecruiterService', () => {
    let saveSpy;
    beforeEach(() => {
        PoolCompaniesModelMock.mockReset();
        findMock.mockReset();
        findOneMock.mockReset();
        saveSpy = jest.fn();
        PoolCompaniesModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
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
            const result = await manageRecruiterService_1.default.getPoolCompanyDetails();
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
            await expect(manageRecruiterService_1.default.getPoolCompanyDetails()).rejects.toEqual({ success: false });
        });
        it('rejects with { success: false } when the find call throws', async () => {
            findMock.mockReturnValue(buildChain(undefined, new Error('Database down')));
            await expect(manageRecruiterService_1.default.getPoolCompanyDetails()).rejects.toEqual({ success: false });
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
            const result = await manageRecruiterService_1.default.getPoolCompanyDetailsById('c1');
            expect(findOneMock).toHaveBeenCalledWith({ _id: 'c1' });
            expect(populateMock).toHaveBeenCalledWith('comments.userId', 'firstName lastName');
            expect(result).toEqual(companyDetails);
            expect(result.comments[0].updateAt.getTime()).toBeGreaterThan(result.comments[1].updateAt.getTime());
        });
        it('returns the company details as is when there are no comments', async () => {
            const companyDetails = { _id: 'c1', companyName: 'Acme' };
            const populateMock = jest.fn().mockReturnValue(companyDetails);
            findOneMock.mockReturnValue({ populate: populateMock });
            const result = await manageRecruiterService_1.default.getPoolCompanyDetailsById('c1');
            expect(result).toEqual(companyDetails);
        });
        it('rejects when the populate call throws', async () => {
            findOneMock.mockReturnValue({
                populate: jest.fn().mockImplementation(() => {
                    throw new Error('Populate failed');
                })
            });
            await expect(manageRecruiterService_1.default.getPoolCompanyDetailsById('c1')).rejects.toThrow('Populate failed');
        });
    });
    describe('addPoolCompany', () => {
        it('creates a pool company document with timestamps and saves it successfully', async () => {
            const savedCompany = { _id: 'c1', companyName: 'Acme' };
            saveSpy.mockResolvedValue(savedCompany);
            const result = await manageRecruiterService_1.default.addPoolCompany({
                companyName: 'Acme'
            });
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
            await expect(manageRecruiterService_1.default.addPoolCompany({ companyName: 'Acme' })).rejects.toThrow('Database save failed');
            expect(PoolCompaniesModelMock).toHaveBeenCalledTimes(1);
            expect(saveSpy).toHaveBeenCalledTimes(1);
        });
    });
});
