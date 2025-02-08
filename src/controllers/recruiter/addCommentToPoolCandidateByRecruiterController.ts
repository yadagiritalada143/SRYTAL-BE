import { Request, Response } from "express";
import addCommentToPoolCandidateByRecruiterService from "../../services/recruiter/addCommentToPoolCandidateByRecruiterService";
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';

const addCommentToPoolCandidateByRecruiter = (req: Request, res: Response) => {
    addCommentToPoolCandidateByRecruiterService
        .addCommentToPoolCandidateByRecruiter(req.body)
        .then((responseAfterCommentAdded: any) => {

            if (responseAfterCommentAdded && responseAfterCommentAdded.comments) {
                responseAfterCommentAdded.comments.sort((a: any, b: any) => b.updateAt - a.updateAt);
            }

            res.status(200).json({ responseAfterCommentAdded });
        })
        .catch((error: any) => {
            console.error(`Error in updating comment for pool candidate: ${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT_TO_POOL_CANDIDATE });
        })
}

export default { addCommentToPoolCandidateByRecruiter }
