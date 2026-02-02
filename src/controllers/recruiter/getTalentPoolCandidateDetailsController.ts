import { Request, Response } from 'express';
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';
import getTalentPoolCandidateDetailsServices from '../../services/recruiter/getTalentPoolCandidateByIdService';

const getTalentPoolCandidateDetailsByRecruiter = (req: Request, res: Response) => {
    const talentPoolCandidateId = req.params.id;
    getTalentPoolCandidateDetailsServices
        .getTalentPoolCandidateDetails(talentPoolCandidateId)
        .then(getTalentPoolCandidateDetailsResponse => {
            res.status(200).json(getTalentPoolCandidateDetailsResponse);
        })
        .catch(error => {
            console.error(`Error in fetching talent pool candidate details:${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS });
        });
};

export default { getTalentPoolCandidateDetailsByRecruiter }
