import { Request, Response } from 'express';
import updateEmploymentTypeService from '../../services/admin/updateEmploymentTypeByAdminService';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES } from '../../constants/admin/employmenttypeMessages';

const updateEmploymentType = (req: Request, res: Response) => {
    const { id, employmentType } = req.body;
    updateEmploymentTypeService
        .updateEmploymentTypeByAdmin(id, employmentType)
        .then((updateEmploymentTypeResponse: any) => {
            res.status(200).json(updateEmploymentTypeResponse);
        })
        .catch((error: any) => {
            console.error(`Error in  updating employment type: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UPDATING_ERROR_MESSAGE});
        });

}

export default { updateEmploymentType }

