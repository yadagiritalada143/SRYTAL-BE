import { ICodingTaskCodeReview } from './codingTaskCodeReview';

export interface IRunCourseTaskCodeTestResult {
    testCaseId: string;
    name: string;
    status:
        | 'PASSED'
        | 'WRONG_OUTPUT'
        | 'REQUEST_ERROR'
        | 'COMPILE_ERROR'
        | 'RUNTIME_ERROR'
        | 'TIMEOUT'
        | 'EXECUTION_ERROR';
    passed: boolean;
    /**
     * `true` for hidden test cases. Sensitive fields (`expectedOutput`,
     * `actualOutput`, detailed `error`) are omitted for hidden cases.
     * Undefined is treated as visible.
     */
    isHidden?: boolean;
    /** Only present for visible test cases. */
    expectedOutput?: string;
    /** Only present for visible test cases. */
    actualOutput?: string;
    /** Only present for visible test cases. */
    error?: string | null;
    skipped?: boolean;
}

export interface IRunCourseTaskCodeResponse {
    codingTaskId: string;
    language: string;
    execution: {
        compilationSuccessful: boolean;
        infrastructureError: string | null;
        retryAfterSeconds: number | null;
        totalTests: number;
        passedTests: number;
        failedTests: number;
        allTestsPassed: boolean;
        testResults: IRunCourseTaskCodeTestResult[];
    };
    evaluation: ICodingTaskCodeReview | null;
    evaluationError: string | null;
    canSubmit: boolean;
}
