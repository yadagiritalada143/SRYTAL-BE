import { Request, Response } from 'express';
import updatePoolCompanyDetailsService from '../../services/recruiter/updateCompanyByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';

const updateCompanyByRecruiter = (req: Request, res: Response) => {
    updatePoolCompanyDetailsService
        .updatePoolCompanyDetails(req.body)
        .then((responseAfterPoolCompanyUpdated: any) => {
            if (responseAfterPoolCompanyUpdated.success) {
                res.status(200).json({ success: true });
            } else {
                res.status(401).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS });
            }

        })
        .catch((error: any) => {
            console.error(`Error while updating pool company details at controller level: ${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_COMPANY_DETAILS });
        });
}

export default { updateCompanyByRecruiter };