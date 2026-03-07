import { Request, Response } from 'express';
import updateDepartmentByAdminService from '../../services/admin/updateDepartmentByAdminService';
import { DEPARTMENT_ERROR_MESSAGES, DEPARTMENT_SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants/admin/departmentMessages';

const updateDepartmentByAdmin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { _id, departmentName } = req.body;
        await updateDepartmentByAdminService.updateDepartmentByAdmin(_id, departmentName);
        return res.status(HTTP_STATUS.OK).json({ success: true, message: DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_UPDATE_SUCCESS_MESSAGE });
    } catch (error: any) {
        console.error(`Error updating department: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_UPDATE_ERROR_MESSAGE });
    }
};

export default { updateDepartmentByAdmin };
