import { Request, Response } from 'express';
import deletePackageService from '../../services/admin/deletePackageByAdminService';
import { PACKAGE_ERROR_MESSAGES } from '../../constants/admin/packageMessages';

const deletePackageByAdmin = (req: Request, res: Response) => {
    const { confirmDelete } = req.body;
    const { id } = req.params;
    if (confirmDelete) {
        deletePackageService
            .hardDeletePackageServiceByAdmin(id)
            .then((deletePackageResponse: any) => {
                res.status(200).json(deletePackageResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (hard) deleting package: ${error}`);
                res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_HARD_DELETE_ERROR_MESSAGE });
            });
    } else {
        deletePackageService
            .softDeletePackageServiceByAdmin(id)
            .then((deletePackageResponse: any) => {
                res.status(200).json(deletePackageResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (soft)  deleting package: ${error}`);
                res.status(500).json({ success: false, message: PACKAGE_ERROR_MESSAGES.PACKAGE_SOFT_DELETE_ERROR_MESSAGE });
            });
    }
}

export default { deletePackageByAdmin }
