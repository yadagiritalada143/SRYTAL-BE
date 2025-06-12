import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import getEmployeePackageDetailsByIdService from '../../services/common/getEmployeePackageDetailsByIdService';

const getEmployeePackageDetailsById = (req: Request, res: Response) => {
    const { employeeId } = req.params;
    getEmployeePackageDetailsByIdService.getEmployeePackageDetailsById(employeeId)
        .then(employeePackageDetailsByIdResponse => {
            res.status(200).json(employeePackageDetailsByIdResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Employee Package details: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
        });
};

export default { getEmployeePackageDetailsById }
