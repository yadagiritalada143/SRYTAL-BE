import { Request, Response } from 'express';
import deleteDepartmentByAdminService from '../../services/admin/deleteDepartmentByAdminService';
import {
  DEPARTMENT_SUCCESS_MESSAGES,
  DEPARTMENT_ERROR_MESSAGES,
  HTTP_STATUS,
} from '../../constants/admin/departmentMessages';

const deleteDepartmentByAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const _id = req.params._id;
    await deleteDepartmentByAdminService.deleteDepartmentByAdmin(_id);
    return res
      .status(HTTP_STATUS.OK)
      .json({
        success: true,
        message: DEPARTMENT_SUCCESS_MESSAGES.DEPARTMENT_DELETE_SUCCESS_MESSAGE,
      });
  } catch (error: any) {
    console.error(`Error in deleting department: ${error}`);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: DEPARTMENT_ERROR_MESSAGES.DEPARTMENT_DELETE_ERROR_MESSAGE,
      });
  }
};

export default { deleteDepartmentByAdmin };
