import { Request, Response } from 'express';
import updateBloodGroupService from '../../services/admin/updateBloodGroupByAdminService';
import { COMMON_ERRORS } from '../../constants/commonErrorMessages';

const updateBloodGroup = (req: Request, res: Response) => {
    const { id, type } = req.body;
    updateBloodGroupService
        .updateBloodGroupByAdmin(id, type)
        .then((updateBloodGroupResponse: any) => {
            res.status(200).json(updateBloodGroupResponse);
        })
        .catch((error: any) => {
            console.error(`Error in  updating blood group: ${error}`);
            res.status(500).json({ success: false, message: COMMON_ERRORS.USER_UPDATING_ERROR });
        });

}

export default { updateBloodGroup }

