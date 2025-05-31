import { Request, Response } from 'express';
import deleteEmployeePackageService from '../../services/admin/deleteEmployeePackagesByAdminService';
import { EMPLOYEE_PACKAGE_ERROR_MESSAGES } from '../../constants/admin/employeePackageMessages';

const deleteEmployeePackageByAdmin = (req: Request, res: Response) => {
    const { employeeId, packageId } = req.body;
    deleteEmployeePackageService
        .deleteEmployeePackageServiceByAdmin(employeeId, packageId)
        .then((deleteEmployeePackageResponse: any) => {
            res.status(200).json(deleteEmployeePackageResponse);
        })
        .catch((error: any) => {
            console.error(`Error in deleting employee packages: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYEE_PACKAGE_ERROR_MESSAGES.EMPLOYEE_PACKAGE_DELETE_ERROR_MESSAGE });
        });
}

export default { deleteEmployeePackageByAdmin };
