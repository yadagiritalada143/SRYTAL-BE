import { Request, Response } from 'express';
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';
import getAllTalentPoolCandidatesServices from '../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService';

const getAllTalentPoolCandidatesByRecruiter = (req: Request, res: Response) => {
    getAllTalentPoolCandidatesServices
        .getAllTalentPoolCandidatesService()
        .then(getAllTalentPoolCandidatesResponse => {
            res.status(200).json(getAllTalentPoolCandidatesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching all talent pool candidates details:${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_FETCHING_POOL_CANDIDATE_DETAILS });
        });
};

export default { getAllTalentPoolCandidatesByRecruiter }
