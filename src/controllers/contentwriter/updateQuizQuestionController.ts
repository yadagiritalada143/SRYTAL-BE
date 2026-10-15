import { Request, Response } from 'express';
import updateQuizQuestionService from '../../services/contentwriter/updateQuizQuestionService';
import updateQuizQuestionSchema from '../../middlewares/schemas/updateQuizQuestionSchema';
import { COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES, COURSE_QUIZ_QUESTION_ERROR_MESSAGES } from '../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';

const updateQuizQuestion = async (req: Request, res: Response) => {
    try {
        const { questionId } = req.params;

        const { error, value } = updateQuizQuestionSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.details[0].message || COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
            });
        }

        const result = await updateQuizQuestionService.updateQuizQuestion({ ...value, questionId });

        if (result.success) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_SUCCESS_MESSAGE,
                data: result.question
            });
        }

        if (result.invalidQuestionId || result.questionNotFound || result.taskNotFound || result.notQuizTask) {
            if (result.questionNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE
                });
            }
            if (result.taskNotFound) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
                });
            }
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE
            });
        }

        if (result.invalidQuestionType || result.invalidQuestion || result.invalidOptions || result.invalidStatus) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message:
                    result.message ||
                    COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE
            });
        }

        if (result.duplicateQuestion) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_DUPLICATE_MESSAGE
            });
        }

        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in updating quiz question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_UPDATE_ERROR_MESSAGE
        });
    }
};

export default { updateQuizQuestion };
