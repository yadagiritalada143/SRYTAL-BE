import CourseQuizQuestionModel from '../../model/courseQuizQuestionModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import {
    ICourseQuizQuestionResponse,
    CourseQuizQuestionType,
} from '../../interfaces/courseQuizQuestion';

const QUESTION_TYPES: CourseQuizQuestionType[] = ['RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA'];

const isValidObjectId = (value: string): boolean => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Validates per-type option rules and returns a normalized option list. */
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

    if (type === 'RADIO' || type === 'DROPDOWN' || type === 'CHECKBOX') {
        if (normalized.length < 4) {
            return { valid: false, message: 'At least 4 options are required !' };
        }
    }

    if (type === 'TOGGLE') {
        if (normalized.length !== 2) {
            return { valid: false, message: 'Exactly 2 options are required !' };
        }
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

/**
 * Updates an existing, non-deleted quiz question. Only the supplied fields are
 * changed; the merged result is validated against the per-type rules. The
 * owning task must still exist and be a QUIZ task (taskId is never reassigned).
 */
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

        // The question must belong to a QUIZ task that the Content Writer can
        // manage. taskId is intentionally never reassigned by an update.
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

        // When the type stays TEXTAREA options are dropped. When it changes away
        // from TEXTAREA, options must be supplied by the request.
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

        // Enforce case-insensitive uniqueness per task when the text changes.
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

        // Touch the parent task/module/course so dependent listings refresh.
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
