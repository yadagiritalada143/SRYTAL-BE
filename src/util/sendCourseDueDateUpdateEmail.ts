import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailConfiguration: any = {
  service: process.env.EMAIL_CONFIG_SERVICE,
  host: process.env.EMAIL_CONFIG_HOST,
  port: Number(process.env.EMAIL_CONFIG_PORT),
  secure: Boolean(process.env.EMAIL_CONFIG_SECURE),
  auth: {
    user: process.env.EMAIL_CONFIG_AUTH_USER,
    pass: process.env.EMAIL_CONFIG_AUTH_PASS,
  }
};

export interface ICourseDueDateUpdateEmailDetails {
    employeeName: string;
    employeeEmail: string;
    courseName: string;
    oldDueDate: Date | string;
    newDueDate: Date | string;
    isExtended: boolean;
}

const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return String(date);
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const sendCourseDueDateUpdateEmail = async (details: ICourseDueDateUpdateEmailDetails): Promise<void> => {

    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const changeLabel = details.isExtended ? 'extended' : 'reduced';
        const changeColor = details.isExtended ? ' rgb(121, 181, 245);' : ' rgb(121, 181, 245);';

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: ${changeColor}; color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Course Due Date ${details.isExtended ? 'Extended' : 'Reduced'}
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear <b>${details.employeeName}</b>,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          The due date for your assigned course has been <b>${changeLabel}</b>. Please review the change below.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${changeColor};">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Course:</b> ${details.courseName}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Previous Due Date:</b> ${formatDate(details.oldDueDate)}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>New Due Date:</b> ${formatDate(details.newDueDate)}
          </p>
          <p style="margin: 0; font-size: 14px; color: ${changeColor}; font-weight: bold;">
            Due date has been ${details.isExtended ? 'extended' : 'reduced'}.
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please ensure you complete the course before the new due date.
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
            subject: `Course Due Date Updated - ${details.courseName}`,
            html: mailBody,
        };

        const result = await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Email sending FAILED!', error?.message || error);
    }
};

export default { sendCourseDueDateUpdateEmail };
