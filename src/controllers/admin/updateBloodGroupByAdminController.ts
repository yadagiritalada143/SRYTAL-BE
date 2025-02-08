import { Request, Response } from 'express';
import updateBloodGroupService from '../../services/admin/updateBloodGroupByAdminService';
import { RECRUITER_ERROR_MESSAGES } from '../../constants/recruiterErrorMessages';

const updateBloodGroup = (req: Request, res: Response) => {
    const { id, type } = req.body;
    updateBloodGroupService
        .updateBloodGroupByAdmin(id, type)
        .then((updateBloodGroupResponse: any) => {
            res.status(200).json(updateBloodGroupResponse);
        })
        .catch((error: any) => {
            console.error(`Error in  updating blood group: ${error}`);
            res.status(500).json({ success: false, message: RECRUITER_ERROR_MESSAGES.ERROR_UPDATING_BLOOD_GROUP_DETAILS });
        });

}

export default { updateBloodGroup }

