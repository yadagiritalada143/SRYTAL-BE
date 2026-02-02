import { Request, Response } from 'express';
import { EMAIL_ERROR_MESSAGE } from '../../constants/commonErrorMessages';
import sendContactUsMailService from '../../services/common/sendContactUsMailService';

const sendContactUsMail = (req: Request, res: Response) => {
    sendContactUsMailService
        .sendContactUsMail(req.body)
        .then((responseAfterSentMail: any) => {
            res.status(200).json({ success: true, message: 'Mail sent successfully !' });
        })
        .catch((error: any) => {
            console.error(`Error while sending email at controller lever: ${error}`);
            res.status(500).json({ success: false, message: EMAIL_ERROR_MESSAGE.SEND_NOTIFICATION_ERROR })
        })
}

export default { sendContactUsMail }