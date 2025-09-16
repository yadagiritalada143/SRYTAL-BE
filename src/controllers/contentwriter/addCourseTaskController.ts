import { Request, Response } from 'express';
import addNewCourseTaskService from '../../services/contentwriter/addCourseTaskService';
import { COURSE_TASK_SUCCESS_MESSAGES, COURSE_TASK_ERRORS_MESSAGES } from '../../constants/contentwriter/coursetaskMessages';

const addTaskToModule = (req: Request, res: Response) => {
    const { moduleId, taskName, taskDescription,thumbnail } = req.body;
    const status = 'ACTIVE';
    addNewCourseTaskService
        .addCourseTaskService(moduleId, taskName, taskDescription, thumbnail, status)
        .then((responseAfteraddingCourseTask: any) => {
            if (responseAfteraddingCourseTask.id) {
                return res
                    .status(201)
                    .json({ message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

export default { addTaskToModule };
