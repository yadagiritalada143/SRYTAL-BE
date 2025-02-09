import { Request, Response } from 'express';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES} from '../../constants/admin/employmenttypeMessages';
import allEmploymentTypeServices from '../../services/admin/getallEmploymentTypeByAdminService'

const getAllEmploymentTypeByAdmin = (req: Request, res: Response) => {
    allEmploymentTypeServices.getAllEmploymentByAdmin()
        .then(fetchAllEmploymentTypeResponse => {
            res.status(200).json(fetchAllEmploymentTypeResponse);
        })
        .catch(error => {
            console.error(`Error in fetching Blood Group details: ${error}`);
            res.status(500).json({ success: false, message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_FETCH_ERROR_MESSAGES });
        });
};

export default { getAllEmploymentTypeByAdmin }
