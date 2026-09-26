import { Request, Response } from 'express';
import sendContactUsMailController from '../../../controllers/common/sendContactUsMailController';
import sendContactUsMailService from '../../../services/common/sendContactUsMailService';
import { EMAIL_ERROR_MESSAGE } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/sendContactUsMailService', () => ({
    __esModule: true,
    default: { sendContactUsMail: jest.fn() }
}));

const sendContactUsMailServiceMock = sendContactUsMailService.sendContactUsMail as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('sendContactUsMailController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        sendContactUsMailServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with success when the mail is sent', async () => {
        const req = { body: { companyName: 'Acme', subject: 'Hi' } } as unknown as Request;
        sendContactUsMailServiceMock.mockResolvedValue('sent');

        await sendContactUsMailController.sendContactUsMail(req, res);
        await flushMicrotasks();

        expect(sendContactUsMailServiceMock).toHaveBeenCalledWith({ companyName: 'Acme', subject: 'Hi' });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Mail sent successfully !' });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { companyName: 'Acme' } } as unknown as Request;
        sendContactUsMailServiceMock.mockRejectedValue(new Error('boom'));

        await sendContactUsMailController.sendContactUsMail(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMAIL_ERROR_MESSAGE.SEND_NOTIFICATION_ERROR
        });
    });
});