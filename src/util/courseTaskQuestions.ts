import { Types } from 'mongoose';

import {
    ICourseTaskQuestion,
    ICourseTaskStarterCode,
} from '../interfaces/courseTask';

export const ACTIVE_QUESTION_STATUS = 'ACTIVE';

/**
 * Questions are addressed by the (taskId, questionId) pair.
 *
 * `null` is the identity of a task's single legacy question.
 */
export type ResolvedQuestionId = string | null;

/**
 * A question as supplied by a content writer,
 * before the schema has minted its questionId.
 */
export type IQuestionInput = {
    question: string;
    description: string;
    status: string;
    order: number;
    starterCode: ICourseTaskStarterCode[];
};

const ACTIVE_STATUS = ACTIVE_QUESTION_STATUS;

/**
 * Converts any value into a string.
 *
 * null / undefined -> ''
 */
const toStringOrEmpty = (
    value: unknown
): string =>
    typeof value === 'string'
        ? value
        : value === null ||
            value === undefined
            ? ''
            : String(value);

/**
 * Turns a raw questions[] entry into a plain question object.
 *
 * Returns null when the question text is missing.
 */
const normalizeQuestion = (
    raw: any
): ICourseTaskQuestion | null => {
    if (!raw) {
        return null;
    }

    const question =
        toStringOrEmpty(
            raw.question
        ).trim();

    if (!question) {
        return null;
    }

    const questionId =
        raw.questionId === null ||
        raw.questionId === undefined
            ? null
            : toStringOrEmpty(
                  raw.questionId
              );

    return {
        questionId,

        question,

        description:
            toStringOrEmpty(
                raw.description
            ),

        status:
            toStringOrEmpty(
                raw.status
            ).toUpperCase() ||
            ACTIVE_STATUS,

        order:
            typeof raw.order === 'number'
                ? raw.order
                : 0,

        starterCode:
            Array.isArray(
                raw.starterCode
            )
                ? (raw.starterCode as ICourseTaskStarterCode[])
                : [],
    };
};

/**
 * Checks whether a question is active/published.
 */
export const isQuestionActive = (
    question?:
        | ICourseTaskQuestion
        | null
): boolean =>
    (
        (question &&
            question.status) ||
        ACTIVE_STATUS
    )
        .toUpperCase() ===
    ACTIVE_STATUS;

/**
 * Returns all questions belonging to a task.
 *
 * New tasks:
 *     Uses task.questions[]
 *
 * Legacy tasks:
 *     Uses task.question + task.starterCode
 */
export const resolveQuestions = (
    task: any
): ICourseTaskQuestion[] => {
    if (!task) {
        return [];
    }

    /**
     * NEW MULTI-QUESTION FLOW
     *
     * If questions[] exists, it is the source of truth.
     */
    if (
        Array.isArray(task.questions) &&
        task.questions.length > 0
    ) {
        return task.questions
            .map(
                (raw: any) =>
                    normalizeQuestion(raw)
            )
            .filter(
                (
                    question:
                        | ICourseTaskQuestion
                        | null
                ): question is ICourseTaskQuestion =>
                    question !== null
            )
            .sort(
                (
                    a: ICourseTaskQuestion,
                    b: ICourseTaskQuestion
                ) =>
                    (a.order || 0) -
                    (b.order || 0)
            );
    }

    /**
     * LEGACY SINGLE-QUESTION FLOW
     *
     * Older tasks may not have questions[].
     *
     * In that case:
     *
     * task.question
     *     -> question text
     *
     * task.starterCode
     *     -> starter code array
     *
     * questionId is null because old records
     * did not have a questionId.
     */
    const legacyQuestion =
        toStringOrEmpty(
            task.question
        ).trim();

    /**
     * If there is no legacy question text,
     * there is nothing to return.
     */
    if (!legacyQuestion) {
        return [];
    }

    return [
        {
            questionId: null,

            /**
             * IMPORTANT:
             *
             * This must be the actual question text.
             *
             * DO NOT use:
             *
             * questions[].starterCode
             */
            question: legacyQuestion,

            description:
                toStringOrEmpty(
                    task.taskDescription
                ),

            status:
                ACTIVE_STATUS,

            order: 0,

            /**
             * Legacy starter code is stored
             * at task.starterCode.
             */
            starterCode:
                Array.isArray(
                    task.starterCode
                )
                    ? (task.starterCode as ICourseTaskStarterCode[])
                    : [],
        },
    ];
};

/**
 * Normalizes a questionId for MongoDB filters.
 *
 * Valid ObjectId:
 *     returns the string
 *
 * Invalid / missing:
 *     returns null
 */
export const toQuestionIdFilter = (
    questionId: unknown
): ResolvedQuestionId => {
    if (
        questionId === null ||
        questionId === undefined
    ) {
        return null;
    }

    const value =
        toStringOrEmpty(
            questionId
        ).trim();

    return value &&
        Types.ObjectId.isValid(
            value
        )
        ? value
        : null;
};

/**
 * Resolves a specific question from a task.
 *
 * If questionId is not supplied:
 *     returns the first active question.
 *
 * If questionId is supplied:
 *     returns the matching question.
 */
export const resolveQuestion = (
    task: any,
    questionId?: unknown
): ICourseTaskQuestion | null => {
    const questions =
        resolveQuestions(task);

    if (questions.length === 0) {
        return null;
    }

    /**
     * No questionId supplied.
     *
     * Return first active question.
     */
    if (
        !toStringOrEmpty(
            questionId
        ).trim()
    ) {
        return (
            questions.find(
                isQuestionActive
            ) ||
            questions[0]
        );
    }

    /**
     * A questionId was supplied.
     */
    const wanted =
        toQuestionIdFilter(
            questionId
        );

    /**
     * Invalid questionId cannot match
     * a question.
     */
    if (wanted === null) {
        return null;
    }

    return (
        questions.find(
            (question) =>
                String(
                    question.questionId
                ) === wanted
        ) || null
    );
};

/**
 * Identifies the task/question pair used
 * by Run Code and Submit Code.
 */
export interface IRunScope {
    taskId: string;
    questionId: string;
}

/**
 * Reads taskId and questionId from
 * Run / Submit request body.
 *
 * New request:
 *
 * {
 *     taskId: "...",
 *     questionId: "..."
 * }
 *
 * Legacy request:
 *
 * {
 *     questionId: "taskId"
 * }
 */
export const resolveRunScope = (
    body: any
): IRunScope => {
    const taskId =
        toStringOrEmpty(
            body?.taskId
        ).trim();

    const questionId =
        toStringOrEmpty(
            body?.questionId
        ).trim();

    /**
     * New request format.
     */
    if (taskId) {
        return {
            taskId,
            questionId,
        };
    }

    /**
     * Legacy request format.
     *
     * questionId actually contains taskId.
     */
    return {
        taskId: questionId,
        questionId: '',
    };
};

/**
 * Counts currently active questions.
 */
export const countActiveQuestions = (
    task: any
): number =>
    resolveQuestions(task).filter(
        isQuestionActive
    ).length;

/**
 * Parses the questions field.
 *
 * The field can arrive as:
 *
 * 1. Normal JSON array
 *
 * OR
 *
 * 2. JSON string from multipart/form-data.
 *
 * Starter code is intentionally ignored when
 * creating questions.
 *
 * Starter code is generated later based on:
 *
 * question + language
 */
export const parseQuestionsField = (
    raw: unknown
): IQuestionInput[] => {
    let source: any = raw;

    /**
     * Multipart form-data may send questions
     * as a JSON string.
     */
    if (typeof source === 'string') {
        const trimmed =
            source.trim();

        if (!trimmed) {
            return [];
        }

        try {
            source =
                JSON.parse(
                    trimmed
                );
        } catch (
            error
        ) {
            return [];
        }
    }

    /**
     * Must be an array.
     */
    if (!Array.isArray(source)) {
        return [];
    }

    const prepared:
        IQuestionInput[] = [];

    source.forEach(
        (
            entry: any,
            index: number
        ) => {
            const question =
                toStringOrEmpty(
                    entry?.question
                ).trim();

            /**
             * Ignore empty questions.
             */
            if (!question) {
                return;
            }

            prepared.push({
                question,

                description:
                    toStringOrEmpty(
                        entry?.description
                    ),

                status:
                    toStringOrEmpty(
                        entry?.status
                    ).toUpperCase() ||
                    ACTIVE_STATUS,

                order:
                    typeof entry?.order ===
                    'number'
                        ? entry.order
                        : index,

                /**
                 * IMPORTANT:
                 *
                 * Do not take starterCode
                 * from the request here.
                 *
                 * It will be generated later:
                 *
                 * question + language
                 */
                starterCode: [],
            });
        }
    );

    return prepared;
};

export default {
    ACTIVE_QUESTION_STATUS,

    isQuestionActive,

    resolveQuestions,

    resolveQuestion,

    countActiveQuestions,

    toQuestionIdFilter,

    parseQuestionsField,
};
