import { Request, Response } from "express";
import addTalentPoolCandidateByRecruiterService from "../../services/recruiter/addTalentPoolCandidateByRecruiterService";
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';

const addTalentPoolCandidateByRecruiter = (req: Request, res: Response) => {
    let candidateDetails = req.body;
    candidateDetails.createdAt = new Date();
    candidateDetails.lastUpdatedAt = new Date();
    if (candidateDetails?.comments?.length) {
        candidateDetails.comments.map((comment: any) => {
            comment.userId = candidateDetails.userId;
            comment.updateAt = new Date();
        });
    }
    addTalentPoolCandidateByRecruiterService
        .addTalentPoolCandidatesByRecruiter(req.body)
        .then((responseAfterCandidateAdded: any) => {
            res.status(200).json({ responseAfterCandidateAdded });
        })
        .catch((error: any) => {
            console.error(`Error in adding talent pool to tracker: ${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_POOL_CANDIDATE_DETAILS });
        })
}

export default { addTalentPoolCandidateByRecruiter };
