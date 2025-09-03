import { Request, Response } from 'express'; 
import addCourseModuleService from '../../services/contentwriter/addCourseModuleService';
import { COURSESMODULE_ADD_SUCCESS_MESSAGES, COURSEMODULE_ADD_ERRORS_MESSAGES } from '../../constants/contentwriter/coursemoduleMessages';

const addNewCourseModuleController = (req: Request, res: Response) => {
    const {courseId, moduleName, moduleDescription} = req.body;
    addCourseModuleService
        .addNewCourseModuleService(courseId, moduleName, moduleDescription)
        .then((responseAfteraddingCourseModule) => {
            if (responseAfteraddingCourseModule.id) {
                return res
                    .status(201)
                    .json({ message: COURSESMODULE_ADD_SUCCESS_MESSAGES.COURSEMODULE_ADD_SUCCESS_MESSAGE });
            } else {
                return res
                    .status(400)
                    .json({ message: COURSEMODULE_ADD_ERRORS_MESSAGES.COURSEMODULE_ADD_ERROR_MESSAGE });
            }
        })
        .catch((error) => {
            console.log(error);
        });
    
}
export default { addNewCourseModuleController };
