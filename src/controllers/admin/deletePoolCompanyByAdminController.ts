import { Request, Response } from 'express';
import poolCompanyByAdminService from '../../services/admin/deletePoolCompanyByAdminService';
import { DELETE_POOL_COMPANY_ERROR_MESSAGE } from '../../constants/admin/manageUserMessages';

const deletePoolCompanyByAdmin = (req: Request, res: Response) => {
    const { confirmDelete } = req.body;
    const { id } = req.params;
    if (confirmDelete) {
        poolCompanyByAdminService
            .hardDeletePoolCompanyByAdmin(id)
            .then((deletePoolCompanyResponse: any) => {
                res.status(200).json(deletePoolCompanyResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (soft) deleting pool company: ${error}`);
                res.status(500).json({ success: false, message: DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_SOFT_DELETE_ERROR_MESSAGE });
            });
    } else {
        poolCompanyByAdminService
            .softDeletePoolCompanyByAdmin(id)
            .then((deletePoolCompanyResponse: any) => {
                res.status(200).json(deletePoolCompanyResponse);
            })
            .catch((error: any) => {
                console.error(`Error in (hard)  deleting pool company: ${error}`);
                res.status(500).json({ success: false, message: DELETE_POOL_COMPANY_ERROR_MESSAGE.DELETE_POOL_COMPANY_HARD_DELETE_ERROR_MESSAGE });
            });
    }
}

export default { deletePoolCompanyByAdmin }
