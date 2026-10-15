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

export interface ILeaveRequestEmailDetails {
    adminEmails?: string[];
    employeeName: string;
    employeeEmail: string;
    leaveReason: string;
    date: Date | string;
    status: string;
    rejectionReason?: string;
    leaveType?: string;
    startDate?: Date | string;
    endDate?: Date | string;
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

const sendLeaveRequestToAdmin = async (details: ILeaveRequestEmailDetails): Promise<void> => {

    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          New Leave Request
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear Admin,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          I have submitted a leave request for the following dates. Please review and approve my request.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(121, 181, 245);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Employee Name:</b> ${details.employeeName}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Employee Email:</b> ${details.employeeEmail}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>LeaveReason:</b> ${details.leaveReason}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Date:</b> ${formatDate(details.date)}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Status:</b> ${details.status}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Kindly review my leave request and take the necessary action at your earliest convenience.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Thank you for your consideration.
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
            to: (details.adminEmails || []).join(', '),
            subject: `New Leave Request - ${details.employeeName}`,
            html: mailBody,
        };

        const result = await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Leave request email sending FAILED!', error?.message || error);
    }
};

const sendLeaveApprovalEmail = async (details: ILeaveRequestEmailDetails): Promise<void> => {

    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Leave Request Approved
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear <b>${details.employeeName}</b>,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          We are happy to inform you that your leave request has been <b>approved</b>.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid  rgb(121, 181, 245);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Leave Reason:</b> ${details.leaveReason}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Date:</b> ${formatDate(details.date)}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Status:</b> ${details.status}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          If you have any questions, please reach out to the admin panel.
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
            subject: `Leave Request Approved - ${details.employeeName}`,
            html: mailBody,
        };

        const result = await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Leave approval email sending FAILED!', error?.message || error);
    }
};

const sendLeaveRejectionEmail = async (details: ILeaveRequestEmailDetails): Promise<void> => {

    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Leave Request Rejected
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear <b>${details.employeeName}</b>,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          We regret to inform you that your leave request has been <b>rejected</b>.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(121, 181, 245);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Leave Reason:</b> ${details.leaveReason}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Date:</b> ${formatDate(details.date)}
          </p>
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Status:</b> ${details.status}
          </p>
          ${details.rejectionReason ? `
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Rejection Reason:</b> ${details.rejectionReason}
          </p>` : ''}
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          If you have any questions, please reach out to the admin panel.
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
            subject: `Leave Request Rejected - ${details.employeeName}`,
            html: mailBody,
        };

        const result = await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Leave rejection email sending FAILED!', error?.message || error);
    }
};

export default { sendLeaveRequestToAdmin, sendLeaveApprovalEmail, sendLeaveRejectionEmail };