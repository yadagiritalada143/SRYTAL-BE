import { ITestCase } from './codingQuestionTestCase';

export interface ICodingQuestionDetail {
    questionId: string;
    question: string;
    allowedLanguages: string[];
    languageId: string;
    starterCode: string;
}

export interface IFetchCodingQuestionResponse {
    success: boolean;
    question?: ICodingQuestionDetail;
    notFound?: boolean;
    notCodingQuestion?: boolean;
    notAssigned?: boolean;
    invalidLanguage?: boolean;
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
    questionId: string;
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
    questionId: string;
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
    executionResult?: IRunCodeExecutionResult;
    lastSubmission?: ILastCodeSubmission | null;
}