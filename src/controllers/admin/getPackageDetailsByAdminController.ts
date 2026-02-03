import { Request, Response } from 'express';
import { PACKAGE_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/packageMessages';
import getPackageDetailsByAdminService from '../../services/admin/getPackageDetailsByAdminService';

const getPackageDetailsByAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const packageDetailsByAdminResponse = await getPackageDetailsByAdminService.getPackageDetailsByAdmin(id);
        res.status(HTTP_STATUS.OK).json(packageDetailsByAdminResponse);
    } catch(error) {
        console.log(`Error in fetching Package details: ${error}`);
         res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DETAILS_FETCH_ERROR_MESSAGE });

    }
};

export default { getPackageDetailsByAdmin }
