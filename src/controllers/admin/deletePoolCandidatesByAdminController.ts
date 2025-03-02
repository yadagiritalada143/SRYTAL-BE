import { Request, Response } from 'express';
import candidateAdminService from '../../services/admin/deletePoolCandidatesByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../constants/admin/manageUserMessages';

const deletePoolCandidateByAdmin = (req: Request, res: Response) => {
    const { id, confirmDelete } = req.body;

    if (confirmDelete) {
        candidateAdminService
            .hardDeletePoolCandidateByAdmin(id)
            .then((deletePoolCandidateResponse: any) => {
                res.status(200).json(deletePoolCandidateResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (soft) deleting pool candidate: ${error}`);
                res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_SOFT_DELETE_ERROR_MESSAGE });
            });
    } else {
        candidateAdminService
            .softDeletePoolCandidateByAdmin(id)
            .then((deletePoolCandidateResponse: any) => {
                res.status(200).json(deletePoolCandidateResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (hard)  deleting pool candidate: ${error}`);
                res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_POOL_CANDIDATE_HARD_DELETE_ERROR_MESSAGE });
            });
    }
}

export default { deletePoolCandidateByAdmin }
