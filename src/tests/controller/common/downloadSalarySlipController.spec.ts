import { Request, Response } from 'express';
import downloadSalarySlipController from '../../../controllers/common/downloadSalarySlipController';
import downloadSalarySlipService from '../../../services/common/downloadSalarySlipService';
import UserModel from '../../../model/userModel';
import {
    EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES,
    EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES,
    HTTP_STATUS
} from '../../../constants/common/employeeSalarySlipMessage';

jest.mock('../../../services/common/downloadSalarySlipService', () => ({
    __esModule: true,
    default: { downloadSalarySlip: jest.fn() }
}));

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const downloadSalarySlipMock = downloadSalarySlipService.downloadSalarySlip as unknown as jest.Mock;
const findByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;

describe('downloadSalarySlipController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        downloadSalarySlipMock.mockReset();
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            body: {
                mongoId: 'u1',
                fullName: 'John Doe',
                month: 'Feb',
                year: '2026',
                ...overrides
            },
            user: { userId: 'u1' }
        } as unknown as Request);

    const mockCurrentUser = (user: any) => {
        findByIdMock.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    };

    it('returns 400 when required parameters are missing', async () => {
        const req = buildReq({ mongoId: undefined });

        await downloadSalarySlipController.downloadSalarySlip(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.INVALID_REQUEST_PARAMS
        });
    });

    it('returns 200 for an employee downloading their own slip', async () => {
        downloadSalarySlipMock.mockResolvedValue({
            success: true,
            downloadUrl: 'https://signed-url/slip.pdf',
            fileName: 'John-Doe-Feb-2026.pdf'
        });

        await downloadSalarySlipController.downloadSalarySlip(buildReq(), res);

        expect(findByIdMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED,
            data: {
                downloadUrl: 'https://signed-url/slip.pdf',
                fileName: 'John-Doe-Feb-2026.pdf'
            }
        });
    });

    it('returns 200 when an admin downloads another employee slip', async () => {
        mockCurrentUser({ userRole: 'admin' });
        downloadSalarySlipMock.mockResolvedValue({ success: true, downloadUrl: 'url', fileName: 'f.pdf' });

        await downloadSalarySlipController.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);

        expect(findByIdMock).toHaveBeenCalledWith('u1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 403 when a non-admin downloads another employee slip', async () => {
        mockCurrentUser({ userRole: 'employee' });

        await downloadSalarySlipController.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.UNAUTHORIZED_ACCESS
        });
    });

    it('returns 403 when the current user cannot be found', async () => {
        mockCurrentUser(null);

        await downloadSalarySlipController.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    });

    it('returns 403 when the current user has no role', async () => {
        mockCurrentUser({ userRole: undefined });

        await downloadSalarySlipController.downloadSalarySlip(buildReq({ mongoId: 'u2' }), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    });

    it('checks the role when the request has no user and treats it as forbidden', async () => {
        const req = {
            body: { mongoId: 'u1', fullName: 'John Doe', month: 'Feb', year: '2026' },
            user: undefined
        } as unknown as Request;
        mockCurrentUser(null);

        await downloadSalarySlipController.downloadSalarySlip(req, res);

        expect(findByIdMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    });

    it('returns 404 when the slip does not exist', async () => {
        downloadSalarySlipMock.mockResolvedValue({ success: false, error: 'SALARY_SLIP_NOT_FOUND' });

        await downloadSalarySlipController.downloadSalarySlip(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_NOT_FOUND
        });
    });

    it('returns 500 for an unknown service failure', async () => {
        downloadSalarySlipMock.mockResolvedValue({ success: false, error: 'OTHER' });

        await downloadSalarySlipController.downloadSalarySlip(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR
        });
    });

    it('returns 500 when the service throws', async () => {
        downloadSalarySlipMock.mockRejectedValue(new Error('boom'));

        await downloadSalarySlipController.downloadSalarySlip(buildReq(), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
});