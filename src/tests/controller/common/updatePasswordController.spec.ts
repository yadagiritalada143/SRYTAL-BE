import { Request, Response } from 'express';
import updatePasswordController from '../../../controllers/common/updatePasswordController';
import updatePasswordService from '../../../services/common/updatePasswordService';

jest.mock('../../../services/common/updatePasswordService', () => ({
    __esModule: true,
    default: { updatePassword: jest.fn() }
}));

const updatePasswordServiceMock = updatePasswordService.updatePassword as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updatePasswordController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updatePasswordServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the response when the password update succeeds', async () => {
        const req = {
            body: { oldPassword: 'old', newPassword: 'new' },
            user: { userId: 'u1' }
        } as unknown as Request;
        updatePasswordServiceMock.mockResolvedValue({ success: true, message: 'Password updated Successfully !' });

        await updatePasswordController.updatePassword(req, res);
        await flushMicrotasks();

        expect(updatePasswordServiceMock).toHaveBeenCalledTimes(1);
        expect(updatePasswordServiceMock).toHaveBeenCalledWith({
            oldPassword: 'old',
            newPassword: 'new',
            userId: 'u1'
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Password updated Successfully !' });
    });

    it('returns 401 when the service reports a failure', async () => {
        const req = {
            body: { oldPassword: 'bad', newPassword: 'new' },
            user: { userId: 'u1' }
        } as unknown as Request;
        updatePasswordServiceMock.mockResolvedValue({ success: false, message: 'Temporary password is not matched !' });

        await updatePasswordController.updatePassword(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Temporary password is not matched !' });
    });

    it('returns 500 when the service throws', async () => {
        const req = {
            body: { oldPassword: 'old', newPassword: 'new' },
            user: { userId: 'u1' }
        } as unknown as Request;
        updatePasswordServiceMock.mockRejectedValue(new Error('boom'));

        await updatePasswordController.updatePassword(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'Error occured while updating the password !' });
    });
});