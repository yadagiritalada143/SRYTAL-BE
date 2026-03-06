import { Request, Response } from 'express';
import getAllDepartments from '../../services/admin/getAllDepartmentByAdminService';
import { DEPARTMENT_SUCCESS_MESSAGES, DEPARTMENT_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/departmentMessages';


const getAllDepartmentByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const departments = await getAllDepartments.getAllDepartmentByAdminService();
        return res.status(HTTP_STATUS.OK).json({ success: true, message: DEPARTMENT_SUCCESS_MESSAGES.FETCH_ALL_DEPARTMENTS_SUCCESS_MESSAGE, data: departments });

    } catch (error: any) {
        console.error(`Error fetching all departments: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: DEPARTMENT_ERROR_MESSAGES.FETCH_ALL_DEPARTMENTS_ERROR_MESSAGE });
    }
};

export default { getAllDepartmentByAdminController };
