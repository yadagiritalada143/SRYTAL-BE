import { ITestCase } from './codingQuestionTestCase';

export interface ICodingQuestionDetail {
    questionId: string;
    question: string;
    allowedLanguages: string[];
    language: string;
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
    language: string;
    totalTestCases: number;
    passedTestCases: number;
    failedTestCases: number;
    score: number;
    results: ICodeRunTestCaseResult[];
    aiEvaluation: IAiCodeQualityEvaluation | null;
}

export interface IRunCodeResponse {
    success: boolean;
    notFound?: boolean;
    notCodingQuestion?: boolean;
    notAssigned?: boolean;
    invalidLanguage?: boolean;
    notAllTestsPassed?: boolean;
    executionResult?: IRunCodeExecutionResult;
}