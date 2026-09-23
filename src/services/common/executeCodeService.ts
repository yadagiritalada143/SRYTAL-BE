import axios from 'axios';
import { LANGUAGE_MAP, LANGUAGE_FILE_EXTENSIONS } from '../../types/languageExecutionMap';

const PISTON_URL =
    process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';
const PISTON_REQUEST_TIMEOUT_MS = 20000;
const PISTON_COMPILE_TIMEOUT_MS = 10000;
const PISTON_RUN_TIMEOUT_MS = 10000;

export type ExecutionStatus =
    | 'COMPLETED'
    | 'COMPILATION_ERROR'
    | 'RUNTIME_ERROR'
    | 'TIME_LIMIT_EXCEEDED'
    | 'INVALID_LANGUAGE'
    | 'EXECUTION_ERROR';

export interface IExecuteCodeParams {
    language: string;
    code: string;
    input?: string;
}

export interface IExecuteCodeResponse {
    stdout: string;
    stderr: string;
    compilationError: string | null;
    runtimeError: string | null;
    status: ExecutionStatus;
    executionTimeMs?: number;
}

/**
 * Reusable executor. Runs the user's submitted code (plus an optional stdin
 * input) on the Piston execution API and normalizes the outcome into
 * stdout / stderr / compilation error / runtime error / status. Nothing is
 * executed on this server.
 */
const executeCode = async ({
    language,
    code,
    input
}: IExecuteCodeParams): Promise<IExecuteCodeResponse> => {
    const startedAt = Date.now();

    const normalizedLanguage = LANGUAGE_MAP[(language || '').trim().toLowerCase()];

    if (!normalizedLanguage) {
        return {
            stdout: '',
            stderr: '',
            compilationError: null,
            runtimeError: 'Unsupported or invalid programming language.',
            status: 'INVALID_LANGUAGE',
            executionTimeMs: 0
        };
    }

    const extension = LANGUAGE_FILE_EXTENSIONS[normalizedLanguage] || 'txt';
    const fileName = normalizedLanguage === 'java' ? 'Main.java' : `solution.${extension}`;

    try {
        const response = await axios.post(
            `${PISTON_URL}/execute`,
            {
                language: normalizedLanguage,
                version: '*',
                files: [{ name: fileName, content: code }],
                stdin: input ?? '',
                compile_timeout: PISTON_COMPILE_TIMEOUT_MS,
                run_timeout: PISTON_RUN_TIMEOUT_MS
            },
            { timeout: PISTON_REQUEST_TIMEOUT_MS }
        );

        const data = response.data || {};
        const run = data.run || {};
        const compile = data.compile || null;
        const executionTimeMs = Date.now() - startedAt;
        const stdout = (run.stdout || run.output || '');
        const stderr = (run.stderr || '');

        if (compile && compile.code !== 0) {
            return {
                stdout: (compile.stdout || ''),
                stderr: (compile.stderr || ''),
                compilationError: (compile.stderr || compile.output || 'Compilation failed, please check your code.'),
                runtimeError: null,
                status: 'COMPILATION_ERROR',
                executionTimeMs
            };
        }

        if (run.code !== undefined && run.code !== 0) {
            return {
                stdout,
                stderr,
                compilationError: null,
                runtimeError: run.signal
                    ? `Process terminated by signal ${run.signal}`
                    : (run.stderr || 'Runtime error: program exited with a non-zero status.'),
                status: 'RUNTIME_ERROR',
                executionTimeMs
            };
        }

        if (run.signal) {
            return {
                stdout,
                stderr,
                compilationError: null,
                runtimeError: `Process terminated by signal ${run.signal}`,
                status: 'RUNTIME_ERROR',
                executionTimeMs
            };
        }

        return {
            stdout,
            stderr,
            compilationError: null,
            runtimeError: null,
            status: 'COMPLETED',
            executionTimeMs
        };
    } catch (error: any) {
        const executionTimeMs = Date.now() - startedAt;

        if (
            error.code === 'ECONNABORTED' ||
            error.response?.status === 408 ||
            String(error.message).includes('timeout')
        ) {
            return {
                stdout: '',
                stderr: '',
                compilationError: null,
                runtimeError: 'Execution timed out on the code execution server.',
                status: 'TIME_LIMIT_EXCEEDED',
                executionTimeMs
            };
        }

        const upstreamMessage = error.response?.data?.message;

        if (upstreamMessage) {
            console.error(`Code execution service error: ${upstreamMessage}`);
            return {
                stdout: '',
                stderr: upstreamMessage,
                compilationError: null,
                runtimeError: null,
                status: 'EXECUTION_ERROR',
                executionTimeMs
            };
        }

        console.error(`Code execution service error: ${error.message}`);
        return {
            stdout: '',
            stderr: error.message || 'Unexpected error while executing the code.',
            compilationError: null,
            runtimeError: null,
            status: 'EXECUTION_ERROR',
            executionTimeMs
        };
    }
};

export default { executeCode };