import { Request, Response } from 'express';
import updateMyModuleAcknowledgementService from '../../services/common/updateMyModuleAcknowledgementService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES, MY_COURSES_SUCCESS_MESSAGES } from '../../constants/common/myCoursesMessages';

const updateMyModuleAcknowledgement = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId, moduleId, acknowledged } = req.body;

        const acknowledgementResponse =
            await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
                courseAssignmentId,
                moduleId,
                acknowledged,
                req.user?.userId as string
            );

        if (acknowledgementResponse.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        if (acknowledgementResponse.invalidModule) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MODULE_NOT_IN_COURSE_MESSAGE
            });
        }

        if (acknowledgementResponse.revocationNotAllowed) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MODULE_ACKNOWLEDGEMENT_REVOCATION_NOT_ALLOWED_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.MODULE_ACKNOWLEDGEMENT_UPDATE_SUCCESS_MESSAGE,
            data: {
                courseAssignmentId: acknowledgementResponse.courseAssignmentId,
                moduleId: acknowledgementResponse.moduleId,
                acknowledged: acknowledgementResponse.acknowledged,
                acknowledgedAt: acknowledgementResponse.acknowledgedAt
            }
        });
    } catch (error: any) {
        console.error(`Error in updating module acknowledgement: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MODULE_ACKNOWLEDGEMENT_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateMyModuleAcknowledgement };