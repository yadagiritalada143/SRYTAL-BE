import axios from 'axios';
import ts from 'typescript';
import { LANGUAGE_MAP } from '../../types/languageExecutionMap';

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const WANDBOX_COMPILER_LIST_URL = 'https://wandbox.org/api/list.json';
const WANDBOX_REQUEST_TIMEOUT_MS = 20000;
const WANDBOX_MAX_ATTEMPTS = 3;
const WANDBOX_RETRY_DELAY_MS = 500;
const WANDBOX_COMPILER_CACHE_MS = 10 * 60 * 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wandbox compilers for the languages we expose. Wandbox's public API needs no
 * API key or IP whitelist, so code execution works locally and on serverless
 * hosting (Vercel) without running any extra infrastructure. TypeScript is
 * transpiled to plain JavaScript first and then run on the Node.js runtime.
 *
 * Compiler versions are NOT hardcoded here because Wandbox can add/remove
 * compiler versions. The currently available compiler is resolved dynamically
 * from Wandbox's compiler list API.
 */
export const WANDBOX_COMPILER_MAP: Record<string, string> = {
    javascript: 'JavaScript',
    python: 'Python',
    typescript: 'JavaScript',
    java: 'Java',
    c: 'C',
    'c++': 'C++'
};

interface IWandboxCompiler {
    name: string;
    version?: string;
    language?: string;
}

let wandboxCompilerCache: IWandboxCompiler[] = [];
let wandboxCompilerCacheTime = 0;

const getWandboxCompilers = async (): Promise<IWandboxCompiler[]> => {
    const now = Date.now();

    if (
        wandboxCompilerCache.length > 0 &&
        now - wandboxCompilerCacheTime < WANDBOX_COMPILER_CACHE_MS
    ) {
        return wandboxCompilerCache;
    }

    const response = await axios.get(
        WANDBOX_COMPILER_LIST_URL,
        { timeout: WANDBOX_REQUEST_TIMEOUT_MS }
    );

    if (!Array.isArray(response.data)) {
        throw new Error('Invalid compiler list received from Wandbox.');
    }

    wandboxCompilerCache = response.data;
    wandboxCompilerCacheTime = now;

    return wandboxCompilerCache;
};

const getWandboxCompiler = async (language: string): Promise<string | null> => {
    const expectedLanguage = WANDBOX_COMPILER_MAP[language];

    if (!expectedLanguage) {
        return null;
    }

    const compilers = await getWandboxCompilers();

    const matchingCompilers = compilers.filter(
        (compiler) =>
            String(compiler.language || '').toLowerCase() ===
            expectedLanguage.toLowerCase()
    );

    if (matchingCompilers.length === 0) {
        return null;
    }

    /*
     * Wandbox can have multiple compiler versions for the same language.
     *
     * Prefer the compiler whose name contains the latest-looking version.
     * The compiler list returned by Wandbox is used instead of hardcoding
     * versions such as nodejs-20.17.0 or cpython-3.12.7.
     */
    const sortedCompilers = [...matchingCompilers].sort((a, b) => {
        const versionA = String(a.version || '');
        const versionB = String(b.version || '');

        return versionB.localeCompare(versionA, undefined, {
            numeric: true,
            sensitivity: 'base'
        });
    });

    return sortedCompilers[0].name;
};

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
 * input) on the Wandbox execution API and normalizes the outcome into
 * stdout / stderr / compilation error / runtime error / status. Nothing is
 * executed on this server.
 */
const executeCode = async ({
    language,
    code,
    input
}: IExecuteCodeParams): Promise<IExecuteCodeResponse> => {
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

    return executeOnWandbox({
        language: normalizedLanguage,
        code,
        input
    });
};

/**
 * Transpiles a TypeScript submission to plain JavaScript so it can run on a
 * plain Node.js runtime (Wandbox's TypeScript compiler has no Node type
 * definitions, which breaks `require` / node imports at type-check time).
 */
const transpileTypeScript = (
    sourceCode: string
): { code: string; diagnostics: string | null } => {
    const result = ts.transpileModule(sourceCode, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2017,
            esModuleInterop: true,
            strict: false
        },
        reportDiagnostics: true
    });

    const errors = (result.diagnostics || []).filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    );

    if (errors.length > 0) {
        const messages = errors
            .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
            .join('\n');
        return { code: '', diagnostics: messages };
    }

    return { code: result.outputText, diagnostics: null };
};

const executeOnWandbox = async ({
    language,
    code,
    input
}: {
    language: string;
    code: string;
    input?: string;
}): Promise<IExecuteCodeResponse> => {
    const startedAt = Date.now();

    let compiler: string | null = null;

    try {
        compiler = await getWandboxCompiler(language);
    } catch (error: any) {
        console.error(
            `Failed to get available Wandbox compilers: ${error.message}`
        );

        return {
            stdout: '',
            stderr: error.message || 'Unable to retrieve Wandbox compilers.',
            compilationError: null,
            runtimeError: null,
            status: 'EXECUTION_ERROR',
            executionTimeMs: Date.now() - startedAt
        };
    }

    if (!compiler) {
        return {
            stdout: '',
            stderr: '',
            compilationError: null,
            runtimeError: `No Wandbox compiler available for the language '${language}'.`,
            status: 'INVALID_LANGUAGE',
            executionTimeMs: 0
        };
    }

    let wandboxCode = code;

    if (language === 'java') {
        wandboxCode = code.replace(
            /\bpublic\s+class\s+Main\b/g,
            'public class prog'
        );
    } else if (language === 'typescript') {
        const transpilation = transpileTypeScript(code);

        if (transpilation.diagnostics) {
            return {
                stdout: '',
                stderr: '',
                compilationError: transpilation.diagnostics,
                runtimeError: null,
                status: 'COMPILATION_ERROR',
                executionTimeMs: Date.now() - startedAt
            };
        }

        wandboxCode = transpilation.code;
    }

    let lastError: any = null;

    for (let attempt = 1; attempt <= WANDBOX_MAX_ATTEMPTS; attempt++) {
        try {
            const response = await axios.post(
                WANDBOX_URL,
                {
                    code: wandboxCode,
                    compiler,
                    stdin: input ?? '',
                    'compiler-option-raw': '',
                    save: false
                },
                { timeout: WANDBOX_REQUEST_TIMEOUT_MS }
            );

            const executionTimeMs = Date.now() - startedAt;

            return normalizeWandboxResponse(
                response.data || {},
                executionTimeMs
            );
        } catch (error: any) {
            lastError = error;

            if (
                isTransientWandboxError(error) &&
                attempt < WANDBOX_MAX_ATTEMPTS
            ) {
                await wait(WANDBOX_RETRY_DELAY_MS * attempt);
                continue;
            }

            break;
        }
    }

    const executionTimeMs = Date.now() - startedAt;

    if (
        lastError?.code === 'ECONNABORTED' ||
        lastError?.response?.status === 408 ||
        String(lastError?.message).includes('timeout')
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

    const upstreamMessage = lastError?.response?.data?.message;

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

    console.error(
        `Code execution service error: ${lastError?.message}`
    );

    return {
        stdout: '',
        stderr:
            lastError?.message ||
            'Unexpected error while executing the code.',
        compilationError: null,
        runtimeError: null,
        status: 'EXECUTION_ERROR',
        executionTimeMs
    };
};

/**
 * Converts a successful Wandbox response into the normalized execution result.
 */
const normalizeWandboxResponse = (
    data: any,
    executionTimeMs: number
): IExecuteCodeResponse => {
    const stdout = data.program_output || data.program || '';
    const stderr = data.program_error || '';
    const compilerOutput = (data.compiler_output || '').trim();
    const compilationError = (data.compiler_error || '').trim() || null;
    const statusCode = String(data.status ?? '0');

    if (
        compilationError ||
        (statusCode !== '0' && !stdout && !stderr && compilerOutput)
    ) {
        return {
            stdout: '',
            stderr: compilerOutput,
            compilationError:
                compilationError ||
                compilerOutput ||
                'Compilation failed, please check your code.',
            runtimeError: null,
            status: 'COMPILATION_ERROR',
            executionTimeMs
        };
    }

    if (stderr || data.signal) {
        return {
            stdout,
            stderr,
            compilationError: null,
            runtimeError: stderr
                ? stderr
                : `Process terminated by signal ${data.signal}`,
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
};

/**
 * Whether an axios error is worth retrying. Retries are limited to transport
 * failures and transient upstream responses (timeouts, rate limits, and 5xx
 * gateway errors from Wandbox's Cloudflare layer) — never 4xx application
 * errors, where retrying cannot help.
 */
const isTransientWandboxError = (error: any): boolean => {
    if (!error) {
        return false;
    }

    const status = error.response?.status;
    const code = error.code;

    return (
        status === 408 ||
        status === 429 ||
        (typeof status === 'number' && status >= 500) ||
        code === 'ECONNABORTED' ||
        code === 'ECONNRESET' ||
        code === 'ENOTFOUND' ||
        code === 'EAI_AGAIN' ||
        code === 'ETIMEDOUT' ||
        String(error.message).includes('timeout')
    );
};

export default { executeCode };
