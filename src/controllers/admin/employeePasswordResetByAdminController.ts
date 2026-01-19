import { Request, Response } from 'express';
import employeePasswordResetByAdminService from '../../services/admin/employeePasswordResetByAdminService';
import { ADMIN_ERROR_MESSAGES } from '../../constants/adminErrorMessages';

const employeePasswordResetByAdmin = (req: Request, res: Response) => {
    const { employeeId } = req.body;
    employeePasswordResetByAdminService
        .employeePasswordResetByAdmin(employeeId)
        .then((afterForcePasswordResetResponse: any) => {
            if (afterForcePasswordResetResponse) {
                res.status(200).json({ success: true });
            } else {
                res.status(400).json({ success: false, message: ADMIN_ERROR_MESSAGES.RESET_EMPLOYEE_PASSWORD_ERROR });
            }
        })
        .catch((error: any) => {
            console.error('Error occured while asking to reset the password:', error)
            res.status(500).json({ success: true, message: ADMIN_ERROR_MESSAGES.RESET_EMPLOYEE_PASSWORD_ERROR });
        })
}

export default { employeePasswordResetByAdmin }
