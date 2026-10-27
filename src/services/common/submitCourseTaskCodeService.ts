import { Types } from 'mongoose';

import CourseTaskModel from '../../model/courseTaskModel';
import CourseTaskCodeSubmissionModel from '../../model/courseTaskCodeSubmissionModel';

import runCourseTaskCodeService from './runCourseTaskCodeService';
import reviewCourseTaskCodeService from './reviewCourseTaskCodeService';

import { ICodingTaskCodeReview } from '../../interfaces/codingTaskCodeReview';
import {
    IRunCourseTaskCodeResponse,
    IRunCourseTaskCodeTestResult
} from '../../interfaces/runCourseTaskCode';
import { ISubmitCourseTaskCodeResponse } from '../../interfaces/courseTaskCodeSubmission';
import { normalizeLanguage } from '../../util/languageUtils';
import { sanitizeTestResultsForReview } from '../../util/codingTaskReview';
import {
    CODING_TASK_ERROR_MESSAGES,
    CODING_TASK_SUCCESS_MESSAGES
} from '../../constants/common/codingTaskMessages';

const {
    SUBMIT_ALL_TESTS_MUST_PASS_MESSAGE,
    SUBMIT_COMPILE_FAILED_MESSAGE,
    SUBMIT_RUN_REQUIRED_MESSAGE,
    SUBMIT_RESULTS_MISMATCH_MESSAGE,
    SUBMIT_CODE_ERROR_MESSAGE
} = CODING_TASK_ERROR_MESSAGES;

/**
 * A submission is rejected (rather than failing the HTTP request) when the code
 * simply does not satisfy the task yet. Structural/authorization failures keep
 * throwing so the controller can map them to the right status.
 */
const rejectedSubmission = (message: string): ISubmitCourseTaskCodeResponse => ({
    submitted: false,
    canSubmit: false,
    message
});

const isPassingExecution = (
    execution: IRunCourseTaskCodeResponse['execution']
): boolean => {
    if (!execution || !Array.isArray(execution.testResults)) {
        return false;
    }

    const passedCount = execution.testResults.filter(
        (result) => result.passed === true
    ).length;

    return (
        execution.compilationSuccessful === true &&
        !execution.infrastructureError &&
        execution.totalTests === execution.testResults.length &&
        execution.testResults.length > 0 &&
        execution.passedTests === passedCount &&
        execution.failedTests === execution.testResults.length - passedCount &&
        execution.failedTests === 0 &&
        execution.allTestsPassed === true &&
        passedCount === execution.testResults.length
    );
};

/**
 * Hidden cases may not persist any of their input/output diagnostics. Visible
 * cases are stored exactly as executed.
 */
const sanitizeForPersistence = (result: IRunCourseTaskCodeTestResult) => {
    if (result.isHidden === true) {
        return {
            testCaseId: result.testCaseId,
            name: result.name,
            status: result.status,
            passed: result.passed,
            isHidden: true,
            expectedOutput: '',
            actualOutput: '',
            error: null
        };
    }

    return { ...result };
};

/**
 * Fetch the task statement and ask the review service for advisory feedback.
 * Review is best-effort: any failure yields `null` so a provider outage never
 * blocks an otherwise-valid submission.
 */
const requestReview = async (
    taskId: string,
    language: string,
    sourceCode: string,
    testResults: IRunCourseTaskCodeTestResult[],
    userId: string
): Promise<ICodingTaskCodeReview | null> => {
    try {
        const task = await CourseTaskModel.findById(taskId)
            .select('taskName taskDescription')
            .lean<{ taskName?: string; taskDescription?: string } | null>();

        const taskStatement = [
            task?.taskName ? `TASK NAME: ${task.taskName}` : '',
            task?.taskDescription
                ? `TASK DESCRIPTION: ${task.taskDescription}`
                : ''
        ]
            .filter(Boolean)
            .join('\n');

        const review = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            taskStatement || 'Coding task',
            language,
            sourceCode,
            sanitizeTestResultsForReview(testResults),
            userId
        );

        if (review.error) {
            console.warn(`Code review unavailable: ${review.error}`);
        }

        return review.feedback ?? null;
    } catch (error: unknown) {
        console.error(
            'Code review failed:',
            error instanceof Error ? error.message : 'UnknownError'
        );
        return null;
    }
};

/**
 * Submit a coding-task solution.
 *
 * The submitted source is re-executed through the existing Run service so the
 * results are always bound to the authenticated user, task, language and exact
 * source code — a stale or frontend-supplied `canSubmit` flag can never be
 * trusted. Every mandatory case (including hidden ones) must pass before a
 * submission record is stored. Review feedback is advisory and stored only
 * where the schema supports it (the score). Run and Submit stay separate.
 */
const submitCourseTaskCode = async (
    taskId: string,
    languageId: string,
    sourceCode: string,
    userId: string
): Promise<ISubmitCourseTaskCodeResponse> => {
    if (!Types.ObjectId.isValid(taskId)) {
        throw new Error('INVALID_TASK_ID');
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }

    if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
        throw new Error('INVALID_SOURCE_CODE');
    }

    /**
     * Re-execute the exact submitted source. This also reuses the Run service's
     * assignment, task-type, language and saved-test-case validation, and
     * guarantees the results correspond to this user/task/language/source.
     */
    const runResult = await runCourseTaskCodeService.runCourseTaskCode(
        taskId,
        languageId,
        sourceCode,
        userId
    );

    const canonicalLanguage = normalizeLanguage(languageId);

    if (!runResult.execution) {
        return rejectedSubmission(SUBMIT_RUN_REQUIRED_MESSAGE);
    }

    /**
     * Defensive bindings: if the Run result carries a conflicting task or
     * language it cannot be trusted for this submission.
     */
    if (
        runResult.codingTaskId &&
        String(runResult.codingTaskId) !== String(taskId)
    ) {
        return rejectedSubmission(SUBMIT_RESULTS_MISMATCH_MESSAGE);
    }

    if (
        runResult.language &&
        canonicalLanguage &&
        runResult.language !== canonicalLanguage
    ) {
        return rejectedSubmission(SUBMIT_RESULTS_MISMATCH_MESSAGE);
    }

    if (
        !Array.isArray(runResult.execution.testResults) ||
        runResult.execution.testResults.length === 0
    ) {
        return rejectedSubmission(SUBMIT_RUN_REQUIRED_MESSAGE);
    }

    if (runResult.execution.infrastructureError) {
        return rejectedSubmission(SUBMIT_RUN_REQUIRED_MESSAGE);
    }

    const testResults = runResult.execution.testResults;
    const passedCount = testResults.filter(
        (result) => result.passed === true
    ).length;

    if (
        runResult.execution.totalTests !== testResults.length ||
        runResult.execution.passedTests !== passedCount ||
        runResult.execution.failedTests !== testResults.length - passedCount
    ) {
        return rejectedSubmission(SUBMIT_RESULTS_MISMATCH_MESSAGE);
    }

    if (!runResult.execution.compilationSuccessful) {
        return rejectedSubmission(SUBMIT_COMPILE_FAILED_MESSAGE);
    }

    if (
        runResult.execution.failedTests > 0 ||
        !runResult.execution.allTestsPassed ||
        passedCount !== testResults.length
    ) {
        return rejectedSubmission(SUBMIT_ALL_TESTS_MUST_PASS_MESSAGE);
    }

    /**
     * Advisory review. Reuse feedback already returned by the Run result when
     * present; otherwise review here. A review failure never blocks storage.
     */
    let evaluation: ICodingTaskCodeReview | null =
        runResult.evaluation ?? null;

    if (!evaluation && !runResult.evaluationError) {
        evaluation = await requestReview(
            taskId,
            runResult.language || canonicalLanguage || languageId,
            sourceCode,
            testResults,
            userId
        );
    }

    const score =
        typeof evaluation?.score === 'number' ? evaluation.score : null;

    let created;
    try {
        created = await CourseTaskCodeSubmissionModel.create({
            userId,
            codingTaskId: taskId,
            language: runResult.language || canonicalLanguage || languageId,
            sourceCode,
            testResults: testResults.map(sanitizeForPersistence),
            score,
            submittedAt: new Date(),
            status: 'SUBMITTED'
        });
    } catch (error: unknown) {
        console.error(
            'Coding task submission persistence failed:',
            error instanceof Error ? error.message : SUBMIT_CODE_ERROR_MESSAGE
        );
        throw new Error('SUBMISSION_SAVE_FAILED');
    }

    return {
        submitted: true,
        canSubmit: true,
        message:
            CODING_TASK_SUCCESS_MESSAGES.SUBMIT_COURSE_TASK_SUCCESS_MESSAGE,
        submission: {
            id: String(created._id),
            score: created.score ?? score,
            submittedAt: created.submittedAt,
            status: 'SUBMITTED'
        }
    };
};

export default {
    submitCourseTaskCode
};
