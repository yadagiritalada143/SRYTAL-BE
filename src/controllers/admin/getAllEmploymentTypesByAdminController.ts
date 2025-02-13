import { Request, Response } from 'express';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES } from '../../constants/admin/employementTypesMessages';
import allEmploymentTypeServices from '../../services/admin/getAllEmploymentTypeByAdminService';

const getAllEmploymentTypesByAdmin = (req: Request, res: Response) => {
    allEmploymentTypeServices.getAllEmploymentTypesByAdmin()
        .then(fetchAllEmploymentTypesResponse => {
            res.status(200).json(fetchAllEmploymentTypesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching employment type details: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_FETCH_ERROR_MESSAGES });
        });
};

export default { getAllEmploymentTypesByAdmin }
