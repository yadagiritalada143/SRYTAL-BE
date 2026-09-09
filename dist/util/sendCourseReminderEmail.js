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
const formatDueDate = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime()))
        return String(date);
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
const sendCourseReminderEmail = async (details) => {
    try {
        const transporter = nodemailer_1.default.createTransport(emailConfiguration);
        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Course Reminder
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear <b>${details.employeeName}</b>,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          This is a friendly reminder that you have an assigned course that is still incomplete. Please complete it before the due date to stay on track.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(121, 181, 245);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Course:</b> ${details.courseName}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Due Date:</b> ${formatDueDate(details.dueDate)}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please log in and complete the remaining tasks at your earliest convenience.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Click here to access the Employee Login:
          <a href="https://www.srytal.com/srytal/employee/login"
             style="color: #007bff; text-decoration: none; font-weight: bold;">
            https://www.srytal.com/srytal/employee/login
          </a>
          and continue learning.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          If you have any questions, please reach out to
          <a href="mailto:admin@srytal.com" style="color: #007bff; text-decoration: none;">
            admin@srytal.com
          </a>.
        </p>

        <br>
        <p style="margin: 20px 0 5px; font-size: 14px; color: #333;">Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">SRYTAL SYSTEMS INDIA PVT LTD.</p>
      </div>
    </div>
  </body>
</html>`;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: details.employeeEmail,
            subject: `Course Reminder - ${details.courseName}`,
            html: mailBody,
        };
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Course reminder email sending FAILED!', (error === null || error === void 0 ? void 0 : error.message) || error);
    }
};
exports.default = { sendCourseReminderEmail };
