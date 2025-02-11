
import { Request, Response } from 'express';
import deleteEmployeeRoleService from '../../services/admin/deleteEmployeeRoleByAdminService';
import { EMPLOYEE_ROLE_ERRORS_MESSAGES } from '../../constants/admin/employmenttypeMessages';

const deleteEmployeeRole = (req: Request, res: Response) => {
    const { id } = req.params;
    deleteEmployeeRoleService
        .deleteEmployeeRoleByAdmin(id)
        .then((deleteEmployeeRoleResponse: any) => {
            res.status(200).json(deleteEmployeeRoleResponse);
        })
        .catch((error: any) => {
            console.error(`Error in deleting employee role: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_DELETE_ERROR_MESSAGE });
        });

}

export default { deleteEmployeeRole }
