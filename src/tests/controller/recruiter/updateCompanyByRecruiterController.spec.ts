import { Request, Response } from 'express';
import updateCompanyController from '../../../controllers/recruiter/updateCompanyByRecruiterController';
import updateCompanyService from '../../../services/recruiter/updateCompanyByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../../constants/recruiterErrorMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/recruiter/updateCompanyByRecruiterService', () => ({
    __esModule: true,
    default: { updatePoolCompanyDetails: jest.fn() }
}));

const updatePoolCompanyDetailsMock = updateCompanyService.updatePoolCompanyDetails as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateCompanyByRecruiterController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updatePoolCompanyDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates the pool company successfully and returns 200 with a success flag', async () => {
        const req = { body: { id: 'c1', companyName: 'Acme' } } as unknown as Request;
        updatePoolCompanyDetailsMock.mockResolvedValue({ success: true });

        await updateCompanyController.updateCompanyByRecruiter(req, res);
        await flushMicrotasks();

        expect(updatePoolCompanyDetailsMock).toHaveBeenCalledWith({ id: 'c1', companyName: 'Acme' });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 401 with the error message when the update is not successful', async () => {
        const req = { body: { id: 'c1', companyName: 'Acme' } } as unknown as Request;
        updatePoolCompanyDetailsMock.mockResolvedValue({ success: false });

        await updateCompanyController.updateCompanyByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { id: 'c1', companyName: 'Acme' } } as unknown as Request;
        updatePoolCompanyDetailsMock.mockRejectedValue(new Error('Service failure'));

        await updateCompanyController.updateCompanyByRecruiter(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS
        });
    });
});