import { Request, Response } from 'express';
import { EMPLOYEE_ROLE_ERRORS_MESSAGES } from '../../constants/admin/employmenttypeMessages';
import allEmployeeRolesServices from '../../services/admin/getAllEmployeeRoleByAdminService';

const getAllEmployeeRolesByAdmin = (req: Request, res: Response) => {
    allEmployeeRolesServices.getAllEmployeeRolesByAdmin()
        .then(fetchAllEmployeeRolesResponse => {
            res.status(200).json(fetchAllEmployeeRolesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching employee roles: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYEE_ROLE_ERRORS_MESSAGES.EMPLOYEE_ROLE_FETCH_ERROR_MESSAGES });
        });
};

export default { getAllEmployeeRolesByAdmin }
