import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import employeePackageDetailsByIdService from '../../services/common/employeePackageDetailsByIdService';

const employeePackageDetailsByIdController = (req: Request, res: Response) => {
    const { userId } = req.body;
    employeePackageDetailsByIdService.employeePackageDetailsById(userId)
        .then(employeePackageDetailsByIdResponse => {
            res.status(200).json(employeePackageDetailsByIdResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Employee Package details by ID: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
        });
};

export default { employeePackageDetailsByIdController }
