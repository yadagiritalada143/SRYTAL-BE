import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { ICourseQuizQuestionResponse } from '../../interfaces/courseQuizQuestion';
import { CourseQuizQuestionType } from '../../types/courseQuizQuestiontype';
import { MAX_QUIZ_OPTIONS, MIN_QUIZ_OPTIONS, TOGGLE_QUIZ_OPTIONS } from '../../constants/common/quizQuestion';
import { COURSE_QUIZ_QUESTION_ERROR_MESSAGES } from '../../constants/contentwriter/courseQuizQuestionMessages';

const QUESTION_TYPES: CourseQuizQuestionType[] = ['RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA'];

const isValidObjectId = (value: string): boolean => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeAndValidateOptions = (
    type: CourseQuizQuestionType,
    options: any[] | undefined
): { valid: boolean; options?: any[]; message?: string } => {
    if (type === 'TEXTAREA') {
        // Free text: options are never stored, regardless of what was supplied.
        return { valid: true, options: undefined };
    }

    if (!Array.isArray(options) || options.length === 0) {
        return { valid: false, message: 'Options are required for this question type !' };
    }

    const normalized = options.map((opt: any) => ({
        value: String(opt?.value ?? '').trim(),
        ...(opt?.isanswer === true ? { isanswer: true } : {}),
    }));

    if (normalized.some((opt) => opt.value.length === 0)) {
        return { valid: false, message: 'Option value cannot be empty !' };
    }

    const uniqueValues = new Set(normalized.map((opt) => opt.value.toLowerCase()));
    if (uniqueValues.size !== normalized.length) {
        return { valid: false, message: 'Option values must be unique !' };
    }

    const answerCount = normalized.filter((opt) => opt.isanswer === true).length;

    if (type === 'TOGGLE') {
        if (normalized.length !== TOGGLE_QUIZ_OPTIONS) {
            return { valid: false, message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TOGGLE_OPTIONS_MESSAGE };
        }
    } else if (normalized.length < MIN_QUIZ_OPTIONS) {
        return { valid: false, message: COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_MIN_OPTIONS_MESSAGE };
    }

    if (MAX_QUIZ_OPTIONS > 0 && normalized.length > MAX_QUIZ_OPTIONS) {
        return { valid: false, message: `At most ${MAX_QUIZ_OPTIONS} options are allowed !` };
    }

    if (type === 'RADIO' || type === 'DROPDOWN' || type === 'TOGGLE') {
        if (answerCount !== 1) {
            return { valid: false, message: 'Exactly one correct answer is required !' };
        }
    }

    if (type === 'CHECKBOX' && answerCount < 1) {
        return { valid: false, message: 'At least one correct answer is required !' };
    }

    return { valid: true, options: normalized };
};

const updateQuizQuestion = async (payload: any): Promise<ICourseQuizQuestionResponse> => {
    try {
        const { questionId, question, type, options, status } = payload || {};

        if (!questionId || !isValidObjectId(questionId)) {
            return { success: false, invalidQuestionId: true };
        }

        const existing: any = await CourseQuizQuestionModel.findOne({
            _id: questionId,
            isDeleted: false,
        }).lean();

        if (!existing) {
            return { success: false, questionNotFound: true };
        }

        const task: any = await CourseTaskModel.findById(existing.taskId).select('type moduleId').lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }

        const finalType: CourseQuizQuestionType = type
            ? (String(type).toUpperCase() as CourseQuizQuestionType)
            : (existing.type as CourseQuizQuestionType);

        if (!QUESTION_TYPES.includes(finalType)) {
            return { success: false, invalidQuestionType: true };
        }

        const finalQuestion = question !== undefined ? String(question).trim() : String(existing.question || '').trim();
        if (finalQuestion === '') {
            return { success: false, invalidQuestion: true };
        }

        const optionsSource =
            options !== undefined ? options : finalType === 'TEXTAREA' ? undefined : existing.options;
        const optionResult = normalizeAndValidateOptions(finalType, optionsSource);
        if (!optionResult.valid) {
            return { success: false, invalidOptions: true, message: optionResult.message };
        }

        let finalStatus = existing.status;
        if (status !== undefined) {
            const normalizedStatus = String(status).toUpperCase();
            if (normalizedStatus !== 'SHOW' && normalizedStatus !== 'HIDE') {
                return { success: false, invalidStatus: true };
            }
            finalStatus = normalizedStatus;
        }

        if (finalQuestion.toLowerCase() !== String(existing.question || '').toLowerCase()) {
            const duplicate = await CourseQuizQuestionModel.findOne({
                _id: { $ne: questionId },
                taskId: existing.taskId,
                isDeleted: false,
                question: { $regex: `^${escapeRegExp(finalQuestion)}$`, $options: 'i' },
            }).lean();

            if (duplicate) {
                return { success: false, duplicateQuestion: true };
            }
        }

        const updateData: any = {
            question: finalQuestion,
            type: finalType,
            status: finalStatus,
        };

        if (finalType === 'TEXTAREA') {
            updateData.options = undefined;
        } else {
            updateData.options = optionResult.options;
        }

        const updated = await CourseQuizQuestionModel.findByIdAndUpdate(questionId, updateData, {
            new: true,
        }).lean();

        if (task.moduleId) {
            const module: any = await CourseModuleModel.findById(task.moduleId).select('courseId').lean();
            if (module?.courseId) {
                await CourseModel.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
            }
        }

        return { success: true, question: updated };
    } catch (error: any) {
        console.error(`Error in updating quiz question: ${error}`);
        return { success: false };
    }
};

export default { updateQuizQuestion };
