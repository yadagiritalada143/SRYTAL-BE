import { Request, Response } from 'express';
import adminService from '../../services/admin/deleteEmployeeDetailsByAdminService';
import { DELETE_ERROR_MESSAGES } from '../../constants/admin/manageUserMessages';

const deleteProfile = (req: Request, res: Response) => {
    const { id, confirmDelete } = req.body;

    if (confirmDelete) {
        adminService
            .hardDeleteEmployeeProfileByAdmin(id)
            .then((deleteProfileResponse: any) => {
                res.status(200).json(deleteProfileResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (soft) deleting profile details: ${error}`);
                res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_USER_HARD_DELETE_ERROR_MESSAGE });
            });
    } else {
        adminService
            .softDeleteEmployeeProfileByAdmin(id)
            .then((deleteProfileResponse: any) => {
                res.status(200).json(deleteProfileResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (hard) profile details: ${error}`);
                res.status(500).json({ success: false, message: DELETE_ERROR_MESSAGES.DELETE_USER_SOFT_DELETE_ERROR_MESSAGE });
            });
    }
}

export default { deleteProfile }
