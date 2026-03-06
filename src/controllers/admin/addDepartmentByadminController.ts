import { Request, Response } from 'express';
import addDepartment from '../../services/admin/addDepartmentByAdminService';
import { DEPARTMENT_SUCCESS_MESSAGES, DEPARTMENT_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/departmentMessages';

const addDepartmentByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { departmentName } = req.body;
        await addDepartment.addDepartmentByAdminService(departmentName);
        return res.status(HTTP_STATUS.OK).json({ success: true, message: DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_ADD_SUCCESS_MESSAGE });

    } catch (error: any) {
        console.error(`Error while adding department: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_ADD_ERROR_MESSAGE });
    }
}

export default { addDepartmentByAdminController };
