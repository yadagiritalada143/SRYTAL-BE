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
const formatDate = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime()))
        return String(date);
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
const sendCourseCompletionEmail = async (details) => {
    try {
        const transporter = nodemailer_1.default.createTransport(emailConfiguration);
        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Course Completed
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 248, 225); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear ${details.adminName ? `<b>${details.adminName}</b>` : 'Admin'},
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          The following employee has completed an assigned course.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(76, 175, 80);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Employee:</b> ${details.employeeName}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Course:</b> ${details.courseName}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Completed On:</b> ${formatDate(details.completedAt)}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          You can review the employee's progress from the admin panel.
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
            to: details.adminEmail,
            subject: `Course Completed - ${details.courseName} (${details.employeeName})`,
            html: mailBody,
        };
        const result = await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Email sending FAILED!', (error === null || error === void 0 ? void 0 : error.message) || error);
    }
};
exports.default = { sendCourseCompletionEmail };
