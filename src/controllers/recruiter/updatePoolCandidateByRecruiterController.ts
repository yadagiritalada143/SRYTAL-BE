import { Request, Response } from 'express';
import updatePoolCandidateDetailsService from '../../services/recruiter/updatePoolCandidateByRecruiterService';
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';

const updatePoolCandidateByRecruiter = (req: Request, res: Response) => {
    updatePoolCandidateDetailsService
        .updatePoolCandidateDetails(req.body)
        .then((responseAfterPoolCandidateUpdated: any) => {
            if (responseAfterPoolCandidateUpdated.success) {
                res.status(200).json({ success: true });
            } else {
                res.status(401).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS });
            }

        })
        .catch((error: any) => {
            console.error(`Error while updating pool candidate details at controller level: ${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_POOL_CANDIDATE_DETAILS });
        });
}

export default { updatePoolCandidateByRecruiter }
