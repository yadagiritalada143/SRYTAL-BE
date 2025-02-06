
import { Request, Response } from 'express';
import DeleteBloodGroupService from '../../services/admin/deleteBloodGroupByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../constants/admin/manageUserMessages';

const deleteBloodGroup = (req: Request, res: Response) => {
    const id = req.params.id;
    DeleteBloodGroupService
            .DeleteBloodGroupByAdmin(id)
            .then((deleteBloodGroupResponse: any) => {
                res.status(200).json(deleteBloodGroupResponse);
            })
            .catch((error: any) => {
                console.error(`Error in  deleting blood group: ${error}`);
                res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_BLOOD_GROUP_DELETE_ERROR_MESSAGE });
            });
     
}

export default { deleteBloodGroup }

