import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import getEmployeePackageDetailsByAdminService from '../../services/admin/getEmployeePackagesByAdminService';

const getEmployeePackageDetailsByAdmin = (req: Request, res: Response) => {
    const { employeeId } = req.params;
    getEmployeePackageDetailsByAdminService.getEmployeePackageDetailsByAdmin(employeeId)
        .then(employeePackageDetailsByAdminResponse => {
            res.status(200).json(employeePackageDetailsByAdminResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Employee Package details: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
        });
};

export default { getEmployeePackageDetailsByAdmin }
