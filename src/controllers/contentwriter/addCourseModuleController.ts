import { Request, Response } from 'express';
import addCourseModuleService from '../../services/contentwriter/addCourseModuleService';
import { COURSE_MODULE_SUCCESS_MESSAGES, COURSE_MODULE_ERRORS_MESSAGES } from '../../constants/contentwriter/coursemoduleMessages';

const addModuleToCourse = (req: Request, res: Response) => {
    const { courseId, moduleName, moduleDescription } = req.body;
    const status='ACTIVE';
    addCourseModuleService
        .addNewCourseModuleService(courseId, moduleName, moduleDescription, status)
        .then((responseAfteraddingCourseModule) => {
            if (responseAfteraddingCourseModule.id) {
                return res
                    .status(201)
                    .json({ message: COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
        });
}
export default { addModuleToCourse };
