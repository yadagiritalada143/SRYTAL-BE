import { Request, Response } from 'express';
import forgotPasswordService from '../../services/common/forgotPasswordService';

const forgotPassword = (req: Request, res: Response) => {
    const { username } = req.body;
    forgotPasswordService.forgotPassword(username)
        .then((responseAfterforgotPassword: any) => {
            if (!!responseAfterforgotPassword && responseAfterforgotPassword.success) {
                res.status(200).json(responseAfterforgotPassword);
            } else {
                res.status(401).json(responseAfterforgotPassword);
            }
        })
        .catch((error: any) => {
            console.log(`Error occured while updating the password: ${error}`);
            res.status(500).json({ success: false, message: 'Error occured while updating the password !' });
        });
}

export default { forgotPassword }
