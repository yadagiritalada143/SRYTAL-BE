import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import allPacakgesServices from '../../services/admin/getAllPackagesByAdminService';

const getAllPackagesDetails = (req: Request, res: Response) => {
    allPacakgesServices.getAllPackagesByAdmin()
        .then(fetchAllPackagesByAdminResponse => {
            res.status(200).json(fetchAllPackagesByAdminResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Packages details: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE });
        });
};

export default { getAllPackagesDetails }
