import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/packageMessages';
import allPacakgesServices from '../../services/admin/getAllPackagesByAdminService';

const getAllPackagesDetails = async (req: Request, res: Response) => {
    try {
        const fetchAllPackagesByAdminResponse = await allPacakgesServices.getAllPackagesWithTasksByAdmin();
        res.status(HTTP_STATUS.OK).json(fetchAllPackagesByAdminResponse);
    } catch (error) {
        console.error(`Error in fetching Packages details: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_FETCH_ERROR_MESSAGE });

    }
};

export default { getAllPackagesDetails }
