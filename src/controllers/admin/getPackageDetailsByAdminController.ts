import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import getPackageDetailsByAdminService from '../../services/admin/getPackageDetailsByAdminService';

const getPackageDetailsByAdmin = (req: Request, res: Response) => {
    const { id } = req.params;
    getPackageDetailsByAdminService.getPackageDetailsByAdmin(id)
        .then(packageDetailsByAdminResponse => {
            res.status(200).json(packageDetailsByAdminResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Package details: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });
        });
};

export default { getPackageDetailsByAdmin }
