import { Request, Response } from 'express';
import updateCourseModuleService from '../../services/contentwriter/updateCourseModuleService';
import { COURSE_MODULE_ERRORS_MESSAGES } from '../../constants/contentwriter/coursemoduleMessages';
import isValidStatus from '../../util/validateCourseStatusTypesUtil';

const updateCourseModuleController = async (req: Request, res: Response) => {
    try {
        const { id, moduleName, moduleDescription, status } = req.body;

        if (!isValidStatus(status)) {
            return res.status(400).json({
                success: false,
                message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_STATUS_MESSAGE,
            });
        }

        const updateCourseModuleResponse = await updateCourseModuleService.updateCourseModule(
            id,
            moduleName,
            moduleDescription,
            status.toUpperCase(),
        );
        res.status(200).json(updateCourseModuleResponse);
    } catch (error: any) {
        console.error(`Error in updating module: ${error}`);
        res.status(500).json({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE,
        });
    }
};

export default { updateCourseModuleController };
