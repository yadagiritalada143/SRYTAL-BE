
import { Request, Response } from 'express';
import deleteEmploymentTypeService from '../../services/admin/deleteEmploymentTypeByAdminService';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES } from '../../constants/admin/employmenttypeMessages';

const deleteEmploymentType = (req: Request, res: Response) => {
    const { id } = req.params;
    deleteEmploymentTypeService
        .deleteEmploymentTypeByAdmin(id)
        .then((deleteEmploymentTypeResponse: any) => {
            res.status(200).json(deleteEmploymentTypeResponse);
        })
        .catch((error: any) => {
            console.error(`Error in deleting employment type: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_DELETE_ERROR_MESSAGE });
        });

}

export default { deleteEmploymentType }
