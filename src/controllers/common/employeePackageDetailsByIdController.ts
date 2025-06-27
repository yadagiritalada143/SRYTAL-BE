import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import employeePackageDetailsByIdService from '../../services/common/employeePackageDetailsByIdService';

const employeePackageDetailsByIdController = (req: Request, res: Response) => {
    const { userId, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'FROM date and TO date are required !!'
        });
    }

    employeePackageDetailsByIdService.employeePackageDetailsById(userId, startDate, endDate)
        .then(employeePackageDetailsByIdResponse => {
            res.status(200).json(employeePackageDetailsByIdResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Employee Package details: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
        });
};

export default { employeePackageDetailsByIdController };
