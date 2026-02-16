"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const sendContactUsMailService_1 = __importDefault(require("../../services/common/sendContactUsMailService"));
const sendContactUsMail = (req, res) => {
    sendContactUsMailService_1.default
        .sendContactUsMail(req.body)
        .then((responseAfterSentMail) => {
        res.status(200).json({ success: true, message: 'Mail sent successfully !' });
    })
        .catch((error) => {
        console.error(`Error while sending email at controller lever: ${error}`);
        res.status(500).json({ success: false, message: commonErrorMessages_1.EMAIL_ERROR_MESSAGE.SEND_NOTIFICATION_ERROR });
    });
};
exports.default = { sendContactUsMail };
