import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseAssignment from '../../model/courseAssignmentModel';
import { normalizeLanguage, isSupportedLanguage, resolveStarterCode } from '../../util/languageUtils';
import { SUPPORTED_LANGUAGES } from '../../types/languageExecutionMap';
import { IFetchCodingQuestionResponse } from '../../interfaces/codingQuestion';

/**
 * Employee-facing "open a coding question": returns the problem statement, the
 * available languages and the starter code for the requested (or first) language.
 * Scoped by employee so a user can only read questions that belong to one of
 * their assigned courses. The full supported-language list is returned so the
 * employee can pick the language at run time.
 */
const getCodingQuestion = async (
    questionId: string,
    language: string,
    employeeId: string
): Promise<IFetchCodingQuestionResponse> => {
    const task: any = await CourseTaskModel.findById(questionId).lean();

    if (!task) {
        return { success: false, notFound: true };
    }

    if (!task.isCoding) {
        return { success: false, notCodingQuestion: true };
    }

    const parentModule: any = await CourseModuleModel.findById(task.moduleId).lean();

    if (!parentModule?.courseId) {
        return { success: false, notFound: true };
    }

    const assignment: any = await CourseAssignment.findOne({ employeeId, courseId: parentModule.courseId }).lean();

    if (!assignment) {
        return { success: false, notAssigned: true };
    }

    if (language) {
        if (!isSupportedLanguage(language)) {
            return { success: false, invalidLanguage: true };
        }
    }

    const allowedLanguages = SUPPORTED_LANGUAGES;

    const resolvedLanguage = normalizeLanguage(language) ||
        normalizeLanguage(allowedLanguages[0] || '') ||
        allowedLanguages[0] ||
        '';

    return {
        success: true,
        question: {
            questionId: String(task._id),
            question: task.question || '',
            allowedLanguages,
            language: resolvedLanguage,
            starterCode: resolveStarterCode(task, resolvedLanguage)
        }
    };
};

export default { getCodingQuestion };