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

export interface ISendLeaveApplyEmailDetails {
    employeeName: string;
    employeeEmail: string;
    adminEmail: string;
    leaveType: string;
    startDate: Date | string;
    endDate: Date | string;
    numberOfDays: number;
    reason?: string;
    status: string;
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

const sendLeaveApplyEmail = async (details: ISendLeaveApplyEmailDetails): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          New Leave Request
        </h2>
      </div>

      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear Admin,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          An employee has submitted a new leave request. Please review the details below.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(121, 181, 245);">
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Employee Name:</b> ${details.employeeName}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Employee Email:</b> ${details.employeeEmail}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Leave Type:</b> ${details.leaveType}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Start Date:</b> ${formatDate(details.startDate)}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>End Date:</b> ${formatDate(details.endDate)}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Number of Leave Days:</b> ${details.numberOfDays}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Reason:</b> ${details.reason || 'N/A'}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Status:</b> ${details.status}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please review the request and take the necessary action at your earliest convenience.
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
            to: 'thummalaramya21028@gmail.com', // Replace with the actual admin email address
            subject: `New Leave Request - ${details.employeeName}`,
            html: mailBody,
        };

        await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Leave Apply Email sending FAILED!', error?.message || error);
      throw error;
    }
};

export default { sendLeaveApplyEmail };
