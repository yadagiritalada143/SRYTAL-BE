import { Types } from 'mongoose';
import { ICourseTaskQuestion, ICourseTaskStarterCode } from '../interfaces/courseTask';

export const ACTIVE_QUESTION_STATUS = 'ACTIVE';

/**
 * Questions are addressed by the (taskId, questionId) pair. `null` is the
 * identity of a task's single legacy question: documents written before a task
 * could hold many questions have no `questionId` on their test-case / execution
 * rows either, so querying for null is what finds them.
 */
export type ResolvedQuestionId = string | null;

/**
 * A question as supplied by a content writer, before the schema has minted its
 * `questionId`.
 */
export type IQuestionInput = {
    question: string;
    description: string;
    status: string;
    order: number;
    starterCode: ICourseTaskStarterCode[];
};

const ACTIVE_STATUS = ACTIVE_QUESTION_STATUS;

const toStringOrEmpty = (value: unknown): string =>
    typeof value === 'string' ? value : value === null || value === undefined ? '' : String(value);

/**
 * Turns a raw `questions[]` entry (a mongoose subdocument or a lean object) into
 * a plain, fully-populated question. Returns null for entries with no text so a
 * single malformed question cannot break the whole task.
 */
const normalizeQuestion = (raw: any): ICourseTaskQuestion | null => {
    if (!raw) {
        return null;
    }

    const question = toStringOrEmpty(raw.question).trim();
    if (!question) {
        return null;
    }

    const questionId = raw.questionId === null || raw.questionId === undefined
        ? null
        : toStringOrEmpty(raw.questionId);

    return {
        questionId,
        question,
        description: toStringOrEmpty(raw.description),
        status: toStringOrEmpty(raw.status).toUpperCase() || ACTIVE_STATUS,
        order: typeof raw.order === 'number' ? raw.order : 0,
        starterCode: Array.isArray(raw.starterCode) ? (raw.starterCode as ICourseTaskStarterCode[]) : []
    };
};

/**
 * Only published questions are ever shown to an employee, mirroring how module
 * and task status are treated in manageCourseProgress.
 */
export const isQuestionActive = (question?: ICourseTaskQuestion | null): boolean =>
    ((question && question.status) || ACTIVE_STATUS).toUpperCase() === ACTIVE_STATUS;

/**
 * Every question of a task, in the order they should be displayed.
 *
 * Reads `questions[]` and, only when that array is empty, falls back to the
 * legacy top-level `question` / `starterCode` pair so tasks authored before the
 * multi-question change keep working. The synthesized entry carries a null
 * questionId, which is precisely the identity its satellite rows already have.
 */
export const resolveQuestions = (task: any): ICourseTaskQuestion[] => {
    if (!task) {
        return [];
    }

    if (Array.isArray(task.questions) && task.questions.length > 0) {
        return task.questions
            .map((raw: any) => normalizeQuestion(raw))
            .filter((question: ICourseTaskQuestion | null): question is ICourseTaskQuestion => question !== null)
            .sort((a: ICourseTaskQuestion, b: ICourseTaskQuestion) => (a.order || 0) - (b.order || 0));
    }

    // LEGACY (one release): single-question task written before questions[].
    const legacyQuestion = toStringOrEmpty(task.question).trim();
    if (!legacyQuestion) {
        return [];
    }

    return [
        {
            questionId: null,
            question: legacyQuestion,
            description: toStringOrEmpty(task.taskDescription),
            status: ACTIVE_STATUS,
            order: 0,
            starterCode: Array.isArray(task.starterCode) ? (task.starterCode as ICourseTaskStarterCode[]) : []
        }
    ];
};

/**
 * Normalizes a question id for use in a mongo filter. Anything that is not a
 * 24-hex ObjectId collapses to null, which both avoids a CastError on the
 * ObjectId-typed satellite fields and routes legacy reads to the legacy rows.
 */
export const toQuestionIdFilter = (questionId: unknown): ResolvedQuestionId => {
    if (questionId === null || questionId === undefined) {
        return null;
    }
    const value = toStringOrEmpty(questionId).trim();
    return value && Types.ObjectId.isValid(value) ? value : null;
};

/**
 * The question the request is about. Falls back to the first active question
 * when the client does not name one, which is what keeps older clients working.
 * Returns null when the id does not belong to the task.
 */
export const resolveQuestion = (task: any, questionId?: unknown): ICourseTaskQuestion | null => {
    const questions = resolveQuestions(task);
    if (questions.length === 0) {
        return null;
    }

    if (!toStringOrEmpty(questionId).trim()) {
        return questions.find(isQuestionActive) || questions[0];
    }

    // An id was named but it is not a real question id, so it cannot belong to
    // this task - including the null identity of a not-yet-backfilled legacy task.
    const wanted = toQuestionIdFilter(questionId);
    if (wanted === null) {
        return null;
    }

    return questions.find((question) => String(question.questionId) === wanted) || null;
};

export interface IRunScope {
    taskId: string;
    questionId: string;
}

/**
 * Reads the task/question pair from a run or submit body.
 *
 * `taskId` is the coding task and `questionId` the question inside it. Both new
 * fields are optional, so no client breaks: when `taskId` is missing the
 * pre-multi-question shape is honoured and `questionId` is read as the task id,
 * leaving the question to the task's first active entry. A client running a task
 * with several questions should send both, otherwise the question is a guess.
 */
export const resolveRunScope = (body: any): IRunScope => {
    const taskId = toStringOrEmpty(body?.taskId).trim();
    const questionId = toStringOrEmpty(body?.questionId).trim();

    if (taskId) {
        return { taskId, questionId };
    }

    return { taskId: questionId, questionId: '' };
};

/** How many questions of a task are currently published. */
export const countActiveQuestions = (task: any): number =>
    resolveQuestions(task).filter(isQuestionActive).length;

/**
 * Reads the `questions` field of a request body, which arrives either as a real
 * array (JSON body) or as a JSON-encoded string (a multipart form field). Entries
 * without question text are dropped so a partially filled draft cannot create a
 * broken question. Returns an empty list for anything unusable.
 */
export const parseQuestionsField = (raw: unknown): IQuestionInput[] => {
    let source: any = raw;

    if (typeof source === 'string') {
        const trimmed = source.trim();
        if (!trimmed) {
            return [];
        }
        try {
            source = JSON.parse(trimmed);
        } catch (error) {
            return [];
        }
    }

    if (!Array.isArray(source)) {
        return [];
    }

    const prepared: IQuestionInput[] = [];

    source.forEach((entry: any, index: number) => {
        const question = toStringOrEmpty(entry?.question).trim();
        if (!question) {
            return;
        }

        prepared.push({
            question,
            description: toStringOrEmpty(entry?.description),
            status: toStringOrEmpty(entry?.status).toUpperCase() || ACTIVE_STATUS,
            order: typeof entry?.order === 'number' ? entry.order : index,
            // Ignored on purpose: a question added by a writer never carries starter
            // code. It is generated per question + language on first open, and a
            // hand-written one can be set later through /updateCourseTaskQuestion.
            // Reading it here would let a form placeholder like "string" be cached
            // as a manual override and permanently suppress generation.
            starterCode: []
        });
    });

    return prepared;
};

export default {
    ACTIVE_QUESTION_STATUS,
    isQuestionActive,
    resolveQuestions,
    resolveQuestion,
    countActiveQuestions,
    toQuestionIdFilter,
    parseQuestionsField
};
