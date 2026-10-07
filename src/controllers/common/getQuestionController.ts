import { Request, Response } from 'express';
import getQuestionService from '../../services/common/getQuestionService';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { CODING_QUESTION_SUCCESS_MESSAGES, CODING_QUESTION_ERROR_MESSAGES } from '../../constants/common/codingQuestionMessages';

const getQuestion = async (req: Request, res: Response) => {
    try {
        const { taskid, questionid, languageid } = req.params;
        const userId = req.user?.userId;
        if (!taskid || !questionid || !languageid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            });
        }

        if (!userId) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
            });
        }

        const result = await getQuestionService.getQuestion(taskid, questionid, languageid, userId);
        if (!result.success) {
            if (result.notFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (result.questionNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.TASK_QUESTION_NOT_FOUND_MESSAGE
                });
            }

            if (result.notAssigned) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.QUESTION_NOT_ASSIGNED_MESSAGE
                });
            }

            if (result.invalidLanguage) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: CODING_QUESTION_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
                });
            }

            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: CODING_QUESTION_ERROR_MESSAGES.UNABLE_TO_FETCH_CODING_QUESTION_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: CODING_QUESTION_SUCCESS_MESSAGES.CODING_QUESTION_FETCH_SUCCESS_MESSAGE,
            data: result.data
        });

    } catch (error: any) {
        console.error(`Error fetching coding question:${error?.message || error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.CODING_QUESTION_FETCH_ERROR_MESSAGE
        });
    }
};

export default { getQuestion };
