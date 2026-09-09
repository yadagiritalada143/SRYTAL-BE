import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { IExpertConsultation } from '../interfaces/expertConsultation';

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

const sendCustomerThankYouEmail = async (details: IExpertConsultation): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Thank You for Contacting SRYTAL SYSTEMS INDIA PVT LTD.
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear <b>${details.fullName}</b>,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Thank you for reaching out to <b>SRYTAL SYSTEMS INDIA PVT LTD.</b> for an expert consultation.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          We have received your request. Our team will review the information you provided and get back to you shortly to discuss your requirements.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(76, 175, 80);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Your Submitted Details:</b>
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Full Name:</b> ${details.fullName}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Email:</b> ${details.email}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Phone Number:</b> ${details.phoneNumber}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Company:</b> ${details.company || 'N/A'}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Project Budget:</b> ${details.projectBudget}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Timeline:</b> ${details.timeline}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          We appreciate your interest in our services and look forward to speaking with you.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          If you have any additional information or questions in the meantime, please feel free to reach out to us.
        </p>

        <br>
        <p style="margin: 20px 0 5px; font-size: 14px; color: #333;">Best Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">SRYTAL SYSTEMS INDIA PVT LTD.</p>
        <p style="font-size: 13px; color: #666; margin-top: 5px;">Thank you for choosing us.</p>
      </div>
    </div>
  </body>
</html>`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: details.email,
            subject: 'Thank You for Contacting SRYTAL SYSTEMS INDIA PVT LTD.',
            html: mailBody,
        };

        await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Customer Thank You Email sending FAILED!', error?.message || error);
    }
};

const sendAdminNotificationEmail = async (details: IExpertConsultation): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport(emailConfiguration);

        const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">

      <!-- Header Section -->
      <div style="background-color: rgb(33, 150, 243); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          New Expert Consultation Request – ${details.fullName}
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear Admin,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          A new customer has submitted an Expert Consultation request through the website.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(33, 150, 243);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Customer Details:</b>
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Full Name:</b> ${details.fullName}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Email:</b> ${details.email}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Phone Number:</b> ${details.phoneNumber}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Company:</b> ${details.company || 'N/A'}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #333;">
            <b>Project Budget:</b> ${details.projectBudget}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Timeline:</b> ${details.timeline}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please review the customer's requirements and get in touch with them at your earliest convenience.
        </p>

        <br>
        <p style="margin: 20px 0 5px; font-size: 14px; color: #333;">Best Regards,</p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">SRYTAL SYSTEMS INDIA PVT LTD.</p>
        <p style="font-size: 13px; color: #666; margin-top: 5px;">Expert Consultation Notification</p>
      </div>
    </div>
  </body>
</html>`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL_ABOUT_CUSTOMER,
            subject: `New Expert Consultation Request – ${details.fullName}`,
            html: mailBody,
        };

        await transporter.sendMail(mailOptions);

    } catch (error: any) {
      console.error('Admin Notification Email sending FAILED!', error?.message || error);
    }
};

export default { sendCustomerThankYouEmail, sendAdminNotificationEmail };
