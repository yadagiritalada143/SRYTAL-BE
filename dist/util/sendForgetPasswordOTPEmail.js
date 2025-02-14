"use strict";
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
const sendOTPEmail = async (firstName, lastName, userName, tempPassword) => {
    try {
        const transporter = nodemailer_1.default.createTransport(emailConfiguration);
        const mailBody = `     
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height:auto; margin: 0 auto; border: 1px solid #f7f1f4 ; border-radius: 5px;">
      <!-- Header Section -->
      <div style="background-color:rgb(121, 181, 245); color: #fff; text-align: center; padding: 10px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">Hello <b>${firstName} ${lastName}</b></h2>
      </div>

      <!-- Body Section -->
      <div style="background-color:rgb(220, 235, 248); padding: 20px; color:#4f4a4c "><br><br>
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please use the below temporary password to login to the system. Note that you must
          change your password, after successfully logging in with your username and
          temporary password.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          <b>Your Temporary password is:</b> ${tempPassword}
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #d9534f; font-weight: bold;">
          <u>Note:</u> Please change your password as soon as possible before it expires !
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please reach out to 
          <a href="mailto:admin@srytal.com" style="color: #007bff; text-decoration: none;">
            admin@srytal.com
          </a>, if you are facing any issues.
        </p><br>

        <p style="margin: 20px 0 5px; font-size: 14px; color: #333;">Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">SRYTAL SYSTEMS INDIA PVT LTD.</p>
      </div>
    </div>
  </body>
</html> `;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: userName,
            subject: 'Temporary Password to Login !',
            html: mailBody,
        };
        const result = await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return error;
            }
            console.log('Info after sent:', info.response);
            return info.response;
        });
        return result;
    }
    catch (error) {
        console.log('Error in sending Email at services: ', error);
        return error;
    }
};
exports.default = { sendOTPEmail };
