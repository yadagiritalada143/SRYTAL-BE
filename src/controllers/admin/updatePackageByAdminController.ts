import { Request, Response } from 'express';
import updatePackageService from '../../services/admin/updatePackageByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';

const updatePackageByAdminController = (req: Request, res: Response) => {
    const { id, detailsToUpdate } = req.body;
    updatePackageService
        .updatePackageByAdmin(id, detailsToUpdate)
        .then((updatePackageResponse: any) => {
            res.status(200).json(updatePackageResponse);
        })
        .catch((error: any) => {
            console.error(`Error in  updating packages: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_UPDATING_ERROR_MESSAGE });
        });

}

export default { updatePackageByAdminController }
