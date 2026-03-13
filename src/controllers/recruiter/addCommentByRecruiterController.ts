import { Request, Response } from "express";
import addCommentByRecruiterService from "../../services/recruiter/addCommentByRecruiterService";
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';

const addCommentByRecruiter = (req: Request, res: Response) => {
    const userId = req.user?.userId;
    addCommentByRecruiterService
        .addCommentByRecruiter({ ...req.body, userId })
        .then((responseAfterCommentAdded: any) => {

            if (responseAfterCommentAdded && responseAfterCommentAdded.comments) {
                responseAfterCommentAdded.comments.sort((a: any, b: any) => b.updateAt - a.updateAt);
            }

            res.status(200).json({ responseAfterCommentAdded });
        })
        .catch((error: any) => {
            console.error(`Error in updating profile details: ${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT });
        })
}

export default { addCommentByRecruiter };