"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const emailConfiguration = {
    service: process.env.EMAIL_CONFIG_SERVICE,
    host: process.env.EMAIL_CONFIG_HOST,
    port: Number(process.env.EMAIL_CONFIG_PORT),
    secure: Boolean(process.env.EMAIL_CONFIG_SECURE),
    auth: {
        user: process.env.EMAIL_CONFIG_AUTH_USER,
        pass: process.env.EMAIL_CONFIG_AUTH_PASS,
    }
};
const sendContactUsMail = (mailDetailsToFire) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport(emailConfiguration);
        const mailBody = `Hi baalu, 
                            <br />We are from <b>${mailDetailsToFire.companyName}</b>.
                            <br />Please reach out to us at <b>${mailDetailsToFire.customerEmail}</b> to discuss more about ${mailDetailsToFire.subject}<br />
                            <br />Here is the glimpse of discussion:<p>${mailDetailsToFire.message}</p>
                            <br />
                            <b>Thanks and Regards</b>
                            <br />
                            <b>${mailDetailsToFire.companyName}</b>`;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL_ABOUT_CUSTOMER,
            subject: mailDetailsToFire.subject,
            html: mailBody,
        };
        const result = yield transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return error;
            }
            console.log('info after sent:', info.response);
            return info.response;
        });
        console.log('Result after mail sent: ', result);
        return result;
    }
    catch (error) {
        console.log('Error in sending Email at services: ', error);
        return error;
    }
});
exports.default = { sendContactUsMail };
