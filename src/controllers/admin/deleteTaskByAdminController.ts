import { Request, Response } from "express";
import deleteTaskService from "../../services/admin/deleteTaskByAdminService";
import { TASK_ERROR_MESSAGES } from "../../constants/admin/taskMessages";

const deleteTaskByAdmin = (req: Request, res: Response) => {
  const { confirmDelete } = req.body;
  const { id } = req.params;
  if (confirmDelete) {
    deleteTaskService
      .hardDeleteTaskByAdmin(id)
      .then((deletePackageResponse: any) => {
        res.status(200).json(deletePackageResponse);
      })
      .catch((error: any) => {
        console.error(`Error in (hard) deleting task: ${error}`);
        res.status(500).json({
          success: false,
          message: TASK_ERROR_MESSAGES.TASK_HARD_DELETE_ERROR_MESSAGE,
        });
      });
  } else {
    deleteTaskService
      .softDeleteTaskByAdmin(id)
      .then((deletePackageResponse: any) => {
        res.status(200).json(deletePackageResponse);
      })
      .catch((error: any) => {
        console.error(`Error in (soft)  deleting task: ${error}`);
        res.status(500).json({
          success: false,
          message: TASK_ERROR_MESSAGES.TASK_SOFT_DELETE_ERROR_MESSAGE,
        });
      });
  }
};

export default { deleteTaskByAdmin };
