import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { ISalarySlipEmailDetails } from '../interfaces/salarySlip';

const formatPayDate = (dateString: string): string => {
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return dateString;
  return `${year}-${monthsShort[monthIndex]}-${day}`;
};

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

const sendSalarySlipNotificationEmail = async (details: ISalarySlipEmailDetails): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport(emailConfiguration);

    const mailBody = `
<html>
  <body style="font-family: serif; background-color: #f4f4f9; padding: 20px;">
    <div style="max-width: 750px; height: auto; margin: 0 auto; border: 1px solid #f7f1f4; border-radius: 5px;">
      
      <!-- Header Section -->
      <div style="background-color: rgb(121, 181, 245); color: #fff; text-align: center; padding: 12px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
        <h2 style="margin: 0; font-size: 18px;">
          Salary Processed Successfully
        </h2>
      </div>

      <!-- Body Section -->
      <div style="background-color: rgb(220, 235, 248); padding: 20px; color: #4f4a4c;">
        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Dear <b>${details.employeeName}</b>,
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          We are pleased to inform you that your salary for <b>${details.payPeriod}</b> has been successfully processed.
        </p>

        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid rgb(121, 181, 245);">
          <p style="margin: 0 0 10px; font-size: 14px; color: #333;">
            <b>Pay Period:</b> ${details.payPeriod}
          </p>
          <p style="margin: 0; font-size: 14px; color: #333;">
            <b>Pay Date:</b> ${formatPayDate(details.payDate)}
          </p>
        </div>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Please log in to the employee portal to view and download your detailed salary slip.
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          Click here to 
          <a href="https://www.srytal.com/srytal/employee/login" 
             style="color: #007bff; text-decoration: none; font-weight: bold;">
            Login to Portal
          </a>
        </p>

        <p style="margin: 0 0 15px; font-size: 14px; color: #333;">
          If you have any questions regarding your salary, please reach out to 
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
      subject: `Salary Processed - ${details.payPeriod}`,
      html: mailBody,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Salary slip notification email sent successfully to ${details.employeeEmail}`);
  } catch (error) {
    console.error(`Error sending salary slip notification email to ${details.employeeEmail}:`, error);
  }
};

export default { sendSalarySlipNotificationEmail };
