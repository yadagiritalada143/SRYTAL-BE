import { Request, Response } from 'express';
import deleteEmployeeTaskService from '../../services/admin/deleteEmployeeTaskByAdminService';
import { EMPLOYEE_TASK_ERROR_MESSAGE } from '../../constants/admin/employeePackageMessages';

const deleteEmployeeTaskByAdmin = (req: Request, res: Response) => {
    const { employeeId, packageId, taskId } = req.body;
    deleteEmployeeTaskService
        .deleteEmployeeTaskServiceByAdmin(employeeId, packageId, taskId )
        .then((deleteEmployeePackageResponse: any) => {
            res.status(200).json(deleteEmployeePackageResponse);
        })
        .catch((error: any) => {
            console.error(`Error in deleting employee packages: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYEE_TASK_ERROR_MESSAGE.EMPLOYEE_TASK_DELETE_ERROR_MESSAGE });
        });
}

export default { deleteEmployeeTaskByAdmin };
