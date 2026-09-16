import { Request, Response } from 'express';
import manageRecruiterController from '../../../controllers/recruiter/manageRecruiterController';
import manageRecruiterService from '../../../services/recruiter/manageRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/manageRecruiterService', () => ({
    __esModule: true,
    default: {
        getPoolCompanyDetails: jest.fn(),
        getPoolCompanyDetailsById: jest.fn(),
        addPoolCompany: jest.fn()
    }
}));

const getPoolCompanyDetailsMock = manageRecruiterService.getPoolCompanyDetails as unknown as jest.Mock;
const getPoolCompanyDetailsByIdMock = manageRecruiterService.getPoolCompanyDetailsById as unknown as jest.Mock;
const addPoolCompanyMock = manageRecruiterService.addPoolCompany as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('manageRecruiterController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getPoolCompanyDetailsMock.mockReset();
        getPoolCompanyDetailsByIdMock.mockReset();
        addPoolCompanyMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getPoolCompanyDetails', () => {
        it('returns 200 with the pool companies response', async () => {
            const poolCompaniesResponse = {
                success: true,
                poolCompaniesResponse: [{ id: 'c1', companyName: 'Acme' }]
            };
            getPoolCompanyDetailsMock.mockResolvedValue(poolCompaniesResponse);

            await manageRecruiterController.getPoolCompanyDetails({} as Request, res);
            await flushMicrotasks();

            expect(getPoolCompanyDetailsMock).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith(poolCompaniesResponse);
        });

        it('returns 500 with the error message when the service rejects', async () => {
            getPoolCompanyDetailsMock.mockRejectedValue(new Error('Service failure'));

            await manageRecruiterController.getPoolCompanyDetails({} as Request, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_COMPANY_DETAILS
            });
        });
    });

    describe('getPoolCompanyDetailsById', () => {
        it('returns 200 with the pool company details when found', async () => {
            const poolCompanyDetails = { _id: 'c1', companyName: 'Acme' };
            getPoolCompanyDetailsByIdMock.mockResolvedValue(poolCompanyDetails);
            const req = { params: { id: 'c1' } } as unknown as Request;

            await manageRecruiterController.getPoolCompanyDetailsById(req, res);
            await flushMicrotasks();

            expect(getPoolCompanyDetailsByIdMock).toHaveBeenCalledWith('c1');
            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({ success: true, poolCompanyResponse: poolCompanyDetails });
        });

        it('returns 500 with the error message when the service rejects', async () => {
            getPoolCompanyDetailsByIdMock.mockRejectedValue(new Error('Service failure'));
            const req = { params: { id: 'c1' } } as unknown as Request;

            await manageRecruiterController.getPoolCompanyDetailsById(req, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_COMPANY_DETAILS
            });
        });
    });

    describe('addPoolCompany', () => {
        it('adds a pool company successfully and returns 200 with a success flag', async () => {
            const req = { body: { companyName: 'Acme' } } as unknown as Request;
            addPoolCompanyMock.mockResolvedValue(undefined);

            await manageRecruiterController.addPoolCompany(req, res);
            await flushMicrotasks();

            expect(addPoolCompanyMock).toHaveBeenCalledTimes(1);
            expect(addPoolCompanyMock).toHaveBeenCalledWith({ companyName: 'Acme' });
            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
            expect(mockJson).toHaveBeenCalledWith({ success: true });
        });

        it('returns 500 with the error message when the service throws', async () => {
            const req = { body: { companyName: 'Acme' } } as unknown as Request;
            addPoolCompanyMock.mockRejectedValue(new Error('Service failure'));

            await manageRecruiterController.addPoolCompany(req, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_COMPANY_DETAILS
            });
        });
    });
});