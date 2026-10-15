import { Request, Response } from 'express';
import forgotPasswordController from '../../../controllers/common/forgotPasswordController';
import forgotPasswordService from '../../../services/common/forgotPasswordService';

jest.mock('../../../services/common/forgotPasswordService', () => ({
    __esModule: true,
    default: { forgotPassword: jest.fn() }
}));

const forgotPasswordServiceMock = forgotPasswordService.forgotPassword as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('forgotPasswordController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        forgotPasswordServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 when the password reset email is sent', async () => {
        const req = { body: { username: 'john@example.com' } } as unknown as Request;
        const successResponse = { success: true, message: 'Email sent' };
        forgotPasswordServiceMock.mockResolvedValue(successResponse);

        await forgotPasswordController.forgotPassword(req, res);
        await flushMicrotasks();

        expect(forgotPasswordServiceMock).toHaveBeenCalledWith('john@example.com');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(successResponse);
    });

    it('returns 401 when the service reports a failure', async () => {
        const req = { body: { username: 'john@example.com' } } as unknown as Request;
        const failureResponse = { success: false, message: 'User not Exists !' };
        forgotPasswordServiceMock.mockResolvedValue(failureResponse);

        await forgotPasswordController.forgotPassword(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith(failureResponse);
    });

    it('returns 500 when the service throws', async () => {
        const req = { body: { username: 'john@example.com' } } as unknown as Request;
        forgotPasswordServiceMock.mockRejectedValue(new Error('boom'));

        await forgotPasswordController.forgotPassword(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'Error occured in forgot password flow !'
        });
    });
});