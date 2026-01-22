import { Request, Response } from 'express';
import updatePasswordService from '../../services/common/updatePasswordService';

const updatePassword = (req: Request, res: Response) => {
    updatePasswordService.updatePassword(req.body)
        .then((responseAfterPasswordUpdate: any) => {
            if (!!responseAfterPasswordUpdate && responseAfterPasswordUpdate.success) {
                res.status(200).json(responseAfterPasswordUpdate);
            } else {
                res.status(401).json(responseAfterPasswordUpdate);
            }
        })
        .catch((error: any) => {
            console.error(`Error occured while updating the password: ${error}`);
            res.status(500).json({ success: false, message: 'Error occured while updating the password !' });
        });
}

export default { updatePassword }