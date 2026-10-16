export interface IWandboxCompiler {
    name: string;
    language: string;
    version?: string;
}

export interface IWandboxExecutionResult {
    success: boolean;
    actualOutput: string;
    stderr: string;
    error: string | null;
    compileError: string | null;
    runtimeError: string | null;
    executionTime: number;
    serviceError: 'RATE_LIMITED' | 'UNAVAILABLE' | 'REQUEST_ERROR' | null;
    retryAfterSeconds: number | null;
}

export interface IWandboxExecutionContext {
    taskId: string;
    languageId: string;
    languageName: string;
    testCaseId: string;
    testCaseInput?: string;
    javaRunnerSource?: string;
    javaEntryPoint?: string;
}

export interface IWandboxResponse {
    status?: string | number;
    exit_code?: string | number | null;
    program_status?: string | number | null;
    signal?: string | number | null;
    program_output?: string | null;
    program_error?: string | null;
    compiler_error?: string | null;
    compiler_output?: string | null;
    compiler_message?: string | null;
}
