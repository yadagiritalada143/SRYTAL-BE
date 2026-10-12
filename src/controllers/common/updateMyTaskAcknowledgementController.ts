import { Request, Response } from 'express';
import updateMyTaskAcknowledgementService from '../../services/common/updateMyTaskAcknowledgementService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES, MY_COURSES_SUCCESS_MESSAGES } from '../../constants/common/myCoursesMessages';

const updateMyTaskAcknowledgement = async (req: Request, res: Response) => {
    try {
        const { courseAssignmentId, taskId, acknowledged } = req.body;

        const acknowledgementResponse =
            await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
                courseAssignmentId,
                taskId,
                acknowledged,
                req.user?.userId as string
            );

        if (acknowledgementResponse.notFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }

        if (acknowledgementResponse.invalidTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_ASSIGNED_COURSE_MESSAGE
            });
        }

        if (acknowledgementResponse.notFileTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_APPLIES_TO_FILE_MESSAGE
            });
        }

        if (acknowledgementResponse.revocationNotAllowed) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_REVOCATION_NOT_ALLOWED_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: MY_COURSES_SUCCESS_MESSAGES.TASK_ACKNOWLEDGEMENT_UPDATE_SUCCESS_MESSAGE,
            data: {
                courseAssignmentId: acknowledgementResponse.courseAssignmentId,
                taskId: acknowledgementResponse.taskId,
                acknowledged: acknowledgementResponse.acknowledged,
                acknowledgedAt: acknowledgementResponse.acknowledgedAt
            }
        });
    } catch (error: any) {
        console.error(`Error in updating task acknowledgement: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateMyTaskAcknowledgement };