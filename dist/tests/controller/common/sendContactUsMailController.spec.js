"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sendContactUsMailController_1 = __importDefault(require("../../../controllers/common/sendContactUsMailController"));
const sendContactUsMailService_1 = __importDefault(require("../../../services/common/sendContactUsMailService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/common/sendContactUsMailService', () => ({
    __esModule: true,
    default: { sendContactUsMail: jest.fn() }
}));
const sendContactUsMailServiceMock = sendContactUsMailService_1.default.sendContactUsMail;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('sendContactUsMailController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        sendContactUsMailServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with success when the mail is sent', async () => {
        const req = { body: { companyName: 'Acme', subject: 'Hi' } };
        sendContactUsMailServiceMock.mockResolvedValue('sent');
        await sendContactUsMailController_1.default.sendContactUsMail(req, res);
        await flushMicrotasks();
        expect(sendContactUsMailServiceMock).toHaveBeenCalledWith({ companyName: 'Acme', subject: 'Hi' });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true, message: 'Mail sent successfully !' });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { body: { companyName: 'Acme' } };
        sendContactUsMailServiceMock.mockRejectedValue(new Error('boom'));
        await sendContactUsMailController_1.default.sendContactUsMail(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMAIL_ERROR_MESSAGE.SEND_NOTIFICATION_ERROR
        });
    });
});
