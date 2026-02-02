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
}

const sendContactUsMail = async (mailDetailsToFire: any) => {
    try {
        const transporter = nodemailer.createTransport(emailConfiguration);
        const mailBody = `Hi baalu, 
                            <br />We are from <b>${mailDetailsToFire.companyName}</b>.
                            <br />Please reach out to us at <b>${mailDetailsToFire.customerEmail}</b> to discuss more about ${mailDetailsToFire.subject}<br />
                            <br />Here is the glimpse of discussion:<p>${mailDetailsToFire.message}</p>
                            <br />
                            <b>Thanks and Regards</b>
                            <br />
                            <b>${mailDetailsToFire.companyName}</b>`

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_EMAIL_ABOUT_CUSTOMER,
            subject: mailDetailsToFire.subject,
            html: mailBody,
        };

        const result = await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return error;
            }

            console.warn(`info after sent:', ${info.response}`)
            return info.response;
        });

        console.warn(`Result after mail sent: ${result}`)
        return result;
    } catch (error) {
        console.error(`Error in sending Email at services: ${error}`);
        return error;
    }
}

export default { sendContactUsMail };



