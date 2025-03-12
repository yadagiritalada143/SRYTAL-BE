import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';
import allPacakgesServices from '../../services/admin/getAllPackagesByAdminService';

const getAllPacakgesDetails = (req: Request, res: Response) => {
    allPacakgesServices.getAllPackagesByAdmin()
        .then(fetchAllPacakgesByAdminResponse => {
            res.status(200).json(fetchAllPacakgesByAdminResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Packages details: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE });
        });
};

export default { getAllPacakgesDetails }
