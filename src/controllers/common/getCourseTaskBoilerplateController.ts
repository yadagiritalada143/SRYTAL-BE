import { Request, Response } from 'express';
import {
    CODING_TASK_ERROR_MESSAGES,
    CODING_TASK_SUCCESS_MESSAGES
} from '../../constants/common/codingTaskMessages';
import courseTaskBoilerplateService from '../../services/common/courseTaskBoilerplateService';

const getCourseTaskBoilerplate = async (req: Request, res: Response) => {
    const { taskId, languageId } = req.params;
    const userId = req.user?.userId || '';

    try {
        const starterCode =
            await courseTaskBoilerplateService.getOrGenerateCourseTaskBoilerplate(
                taskId,
                languageId,
                userId
            );

        return res.status(200).json({
            success: true,
            message: CODING_TASK_SUCCESS_MESSAGES.BOILERPLATE_FETCH_SUCCESS_MESSAGE,
            data: {
                taskId,
                languageId,
                starterCode
            }
        });
    } catch (error: any) {
        const errorCode = String(error?.message || '');
        console.error(`Error fetching coding task boilerplate: ${errorCode}`);

        if (errorCode === 'INVALID_TASK_OR_LANGUAGE_ID') {
            return res.status(400).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
            });
        }
        if (errorCode === 'CODING_TASK_DESCRIPTION_REQUIRED') {
            return res.status(400).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.CODING_TASK_DESCRIPTION_REQUIRED_MESSAGE
            });
        }
        if (errorCode === 'COURSE_TASK_NOT_FOUND' || errorCode === 'PROGRAMMING_LANGUAGE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                message: errorCode === 'COURSE_TASK_NOT_FOUND'
                    ? CODING_TASK_ERROR_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
                    : CODING_TASK_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
            });
        }
        if (errorCode === 'NOT_CODING_TASK') {
            return res.status(400).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.NOT_CODING_TASK_MESSAGE
            });
        }
        if (errorCode === 'TASK_NOT_ASSIGNED') {
            return res.status(403).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.TASK_NOT_ASSIGNED_MESSAGE
            });
        }
        if (errorCode === 'USER_AUTHENTICATION_REQUIRED') {
            return res.status(401).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
            });
        }
        if (
            errorCode === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
            errorCode === 'OPENROUTER_KEY_NOT_FOUND'
        ) {
            return res.status(400).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE
            });
        }
        if (
            errorCode === 'OPENROUTER_API_KEY_INVALID_FORMAT' ||
            errorCode === 'OPENROUTER_KEY_INVALID'
        ) {
            return res.status(400).json({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_INVALID_MESSAGE
            });
        }

        return res.status(502).json({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.BOILERPLATE_GENERATION_FAILED_MESSAGE
        });
    }
};

export default { getCourseTaskBoilerplate };
