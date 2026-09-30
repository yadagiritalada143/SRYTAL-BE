import { ITestCase } from './codingQuestionTestCase';

/**
 * The employee's own latest submission for a coding question, in a specific
 * language. Surfaced on `getQuestion` so the editor can restore their
 * submitted answer instead of the starter code.
 */
export interface ILastSubmittedCode {
    language: string;
    code: string;
}

export interface IGetQuestionResponse {
    success: boolean;
    taskId?: string;
    questionId?: string | null;
    /** @deprecated Use questionId. */
    taskQuestionId?: string | null;
    taskName?: string;
    question?: string;
    description?: string;
    allowedLanguages?: string[];
    language?: string;
    languageId?: string;
    starterCode?: string;
    lastSubmittedCode?: ILastSubmittedCode | null;
    notFound?: boolean;
    notCodingQuestion?: boolean;
    notAssigned?: boolean;
    invalidLanguage?: boolean;
    // Set when the named question does not belong to the task.
    questionNotFound?: boolean;
}

export interface ICodeRunTestCaseResult extends ITestCase {
    actualOutput: string;
    passed: boolean;
    status: string;
    stderr?: string;
    compilationError?: string;
    runtimeError?: string;
    executionTimeMs?: number;
    errorDetails?: string;
}

export interface IAiCodeQualityEvaluation {
    score: number;
    suggestions: string[];
    failedTests: string[];
    codingStandards: {
        readability: string;
        efficiency: string;
        errorHandling: string;
        namingConventions: string;
    };
    explanation: string;
}

export interface IRunCodeExecutionResult {
    taskId: string;
    questionId: string | null;
    /** @deprecated Use questionId. */
    taskQuestionId: string | null;
    language: string;
    languageId: string;
    totalTestCases: number;
    passedTestCases: number;
    failedTestCases: number;
    score: number;
    results: ICodeRunTestCaseResult[];
    aiEvaluation: IAiCodeQualityEvaluation | null;
}

/**
 * The last code an employee ran or submitted, surfaced alongside a fresh
 * submission so the client can restore what they were working on.
 */
export interface ILastCodeSubmission {
    employeeId: string;
    taskId: string;
    questionId: string | null;
    languageId: string;
    code: string;
    passedTestCases: number;
    failedTestCases: number;
    score: number;
    status: string;
    type: 'run' | 'submit';
    submittedAt?: Date;
}

export interface IRunCodeResponse {
    success: boolean;
    notFound?: boolean;
    notCodingQuestion?: boolean;
    notAssigned?: boolean;
    invalidLanguage?: boolean;
    notAllTestsPassed?: boolean;
    // Set when the named question does not belong to the task.
    questionNotFound?: boolean;
    executionResult?: IRunCodeExecutionResult;
    lastSubmission?: ILastCodeSubmission | null;
}
