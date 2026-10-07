"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendContactUsMailService_1 = __importDefault(require("../../../services/common/sendContactUsMailService"));
const nodemailer_1 = __importDefault(require("nodemailer"));
jest.mock('nodemailer', () => ({
    createTransport: jest.fn()
}));
const createTransportMock = nodemailer_1.default.createTransport;
describe('sendContactUsMailService', () => {
    let sendMailMock;
    beforeEach(() => {
        sendMailMock = jest.fn();
        createTransportMock.mockReset();
        createTransportMock.mockReturnValue({ sendMail: sendMailMock });
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const mailDetails = {
        companyName: 'Acme',
        customerEmail: 'customer@x.com',
        subject: 'Consultation',
        message: 'Hello'
    };
    it('sends the mail and returns the transporter result', async () => {
        sendMailMock.mockResolvedValue('sent');
        const result = await sendContactUsMailService_1.default.sendContactUsMail(mailDetails);
        expect(createTransportMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock).toHaveBeenCalledTimes(1);
        expect(sendMailMock.mock.calls[0][0]).toMatchObject({
            to: expect.anything(),
            subject: 'Consultation',
            html: expect.stringContaining('Acme')
        });
        expect(result).toBe('sent');
    });
    it('returns the error when sending the mail throws', async () => {
        const mailError = new Error('smtp down');
        sendMailMock.mockRejectedValue(mailError);
        const result = await sendContactUsMailService_1.default.sendContactUsMail(mailDetails);
        expect(result).toBe(mailError);
    });
    it('invokes the sendMail callback and resolves with its response', async () => {
        sendMailMock.mockImplementation((_opts, cb) => {
            cb(null, { response: 'SMTP-OK' });
            return Promise.resolve('SMTP-OK');
        });
        const result = await sendContactUsMailService_1.default.sendContactUsMail(mailDetails);
        expect(result).toBe('SMTP-OK');
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('SMTP-OK'));
    });
    it('invokes the sendMail callback error path', async () => {
        sendMailMock.mockImplementation((_opts, cb) => {
            cb(new Error('callback failed'));
            return Promise.resolve('ignored');
        });
        const result = await sendContactUsMailService_1.default.sendContactUsMail(mailDetails);
        expect(result).toBe('ignored');
    });
});
