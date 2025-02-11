import { Request, Response } from 'express';
import updateEmployeeRoleService from '../../services/admin/updateEmployeeRoleByAdminService';
import { EMPLOYEE_ROLE_ERRORS_MESSAGES } from '../../constants/admin/employmenttypeMessages';

const updateEmployeeRole = (req: Request, res: Response) => {
    const { id, designation } = req.body;
    updateEmployeeRoleService
        .updateEmployeeRoleByAdmin(id, designation)
        .then((updateEmployeeRoleResponse: any) => {
            res.status(200).json(updateEmployeeRoleResponse);
        })
        .catch((error: any) => {
            console.error(`Error in updating employee role: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_UPDATING_ERROR_MESSAGE });
        });
}

export default { updateEmployeeRole }

