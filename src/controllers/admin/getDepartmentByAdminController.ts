import { Request, Response } from 'express';
import getDepartmentDetails from '../../services/admin/getDepartmentByAdminService';
import { DEPARTMENT_ERROR_MESSAGES, DEPARTMENT_SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants/admin/departmentMessages';

const getDepartmentByAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { _id } = req.params;
        const departmentDetails = await getDepartmentDetails.getDepartmentByAdmin(_id);  
        if (!departmentDetails) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_NOT_FOUND_ERROR_MESSAGE });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: DEPARTMENT_SUCCESS_MESSAGES.FETCH_DEPARTMENT_SUCCESS_MESSAGE, data: departmentDetails });
    } catch (error: any) {
        console.error(`Error in fetching department details: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: DEPARTMENT_ERROR_MESSAGES.FETCH_DEPARTMENT_ERROR_MESSAGE });
    }
};

export default { getDepartmentByAdmin };
