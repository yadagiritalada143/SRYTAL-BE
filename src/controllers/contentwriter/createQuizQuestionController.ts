import { Request, Response } from 'express';
import createQuizQuestionService from '../../services/contentwriter/createQuizQuestionService';
import { COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES, COURSE_QUIZ_QUESTION_ERROR_MESSAGES} from '../../constants/contentwriter/courseQuizQuestionMessages';
import { HTTP_STATUS } from '../../constants/commonErrorMessages';
import { ICourseQuizQuestionOption, CourseQuizQuestionType, CourseQuizQuestionStatus } from '../../interfaces/courseQuizQuestion';

/**
 * Enforces the per-type option rules:
 *  - RADIO / DROPDOWN : at least four options, exactly one correct.
 *  - CHECKBOX         : at least four options, at least one correct.
 *  - TOGGLE           : exactly two options, exactly one correct.
 *  - TEXTAREA         : free text, options are not required.
 * Returns an error key (mapped to a message by the caller) or null when valid.
 */
const validateOptions = (
    type: string,
    options: ICourseQuizQuestionOption[] | undefined
): keyof typeof COURSE_QUIZ_QUESTION_ERROR_MESSAGES | null => {
    if (type === 'TEXTAREA') {
        return null;
    }

    const providedOptions = Array.isArray(options) ? options : [];

    if (type === 'TOGGLE') {
        if (providedOptions.length !== 2) {
            return 'COURSE_QUIZ_QUESTION_TOGGLE_OPTIONS_MESSAGE';
        }
    } else if (providedOptions.length < 4) {
        return 'COURSE_QUIZ_QUESTION_MIN_OPTIONS_MESSAGE';
    }

    const correctCount = providedOptions.filter((option) => option?.isanswer === true).length;

    if (type === 'CHECKBOX') {
        if (correctCount < 1) {
            return 'COURSE_QUIZ_QUESTION_MIN_ANSWER_MESSAGE';
        }
    } else if (correctCount !== 1) {
        return 'COURSE_QUIZ_QUESTION_SINGLE_ANSWER_MESSAGE';
    }

    return null;
};

const createQuizQuestion = async (req: Request, res: Response) => {
    try {
        const { taskId, question, type, options, status } = req.body;

        const normalizedType = String(type || '').toUpperCase() as CourseQuizQuestionType;
        const normalizedStatus = String(status || 'SHOW').toUpperCase() as CourseQuizQuestionStatus;

        const optionError = validateOptions(normalizedType, options);
        if (optionError) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES[optionError]
            });
        }

        const result = await createQuizQuestionService.createQuizQuestion(
            taskId,
            question,
            normalizedType,
            options,
            normalizedStatus
        );

        if (result.success) {
            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES.COURSE_QUIZ_QUESTION_ADD_SUCCESS_MESSAGE,
                data: result.question
            });
        }

        if (result.taskNotFound) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE
            });
        }

        if (result.notQuizTask) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_NOT_QUIZ_TASK_MESSAGE
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
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_ADD_ERROR_MESSAGE
        });
    } catch (error: any) {
        console.error(`Error in creating quiz question: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_ADD_ERROR_MESSAGE
        });
    }
};

export default { createQuizQuestion };
