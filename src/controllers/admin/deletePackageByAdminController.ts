
import { Request, Response } from 'express';
import deletePackageService from '../../services/admin/deletePackageByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';

const deletePackage = (req: Request, res: Response) => {
    const id = req.params.id;
    deletePackageService
        .deletePackageByAdmin(id)
        .then((deletePackageResponse: any) => {
            res.status(200).json(deletePackageResponse);
        })
        .catch((error: any) => {
            console.error(`Error in deleting package: ${error}`);
            res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_DELETE_ERROR_MESSAGE });
        });
}

export default { deletePackage }
