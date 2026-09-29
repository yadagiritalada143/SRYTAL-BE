import axios from 'axios';
import ts from 'typescript';
import { LANGUAGE_MAP } from '../../types/languageExecutionMap';
import { isExecutableLanguage, getWandboxLabel } from '../../util/languageUtils';

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const WANDBOX_COMPILER_LIST_URL = 'https://wandbox.org/api/list.json';
const WANDBOX_REQUEST_TIMEOUT_MS = 20000;
const WANDBOX_SLOW_REQUEST_TIMEOUT_MS = 60000;
const WANDBOX_MAX_ATTEMPTS = 3;
const WANDBOX_RETRY_DELAY_MS = 500;
const WANDBOX_COMPILER_CACHE_MS = 10 * 60 * 1000;

/*
 * Compilers that routinely exceed the 20s default because their cold compile
 * is heavy (measured in seconds: Go ~30-35, Rust ~31, Haskell ~23, Zig ~20).
 * They get a longer per-attempt timeout; counting on retries instead is
 * pointless because retrying a timeout just burns another 20s.
 */
const WANDBOX_SLOW_COMPILE_LANGUAGES = new Set(['go', 'rust', 'haskell', 'zig', 'swift']);

const getRequestTimeoutMs = (canonicalKey: string): number =>
    WANDBOX_SLOW_COMPILE_LANGUAGES.has(canonicalKey)
        ? WANDBOX_SLOW_REQUEST_TIMEOUT_MS
        : WANDBOX_REQUEST_TIMEOUT_MS;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execution runs on Wandbox, whose public API needs no API key or IP whitelist,
 * so code execution works locally and on serverless hosting (Vercel) without
 * any extra infrastructure. TypeScript is transpiled to plain JavaScript first
 * and then run on the Node.js runtime (the type-script compiler on Wandbox has
 * no Node type definitions, which breaks `require`/node imports).
 *
 * The language whitelist lives in LANGUAGE_REGISTRY (see languageExecutionMap):
 * every canonical key resolves its Wandbox label there. Compiler VERSIONS are
 * never hardcoded - Wandbox adds/removes them constantly, so the current
 * compiler for a language is resolved dynamically from the compiler list API.
 */
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

/*
 * Resolves the Wandbox compiler for a CANONICAL language key (e.g. 'go',
 * 'c++'). The expected label comes from the registry; TypeScript is special -
 * it is transpiled locally and executed on the JavaScript/Node runtime, so it
 * resolves to the 'JavaScript' label rather than Wandbox's TypeScript compiler.
 */
const getWandboxCompiler = async (canonicalKey: string): Promise<string | null> => {
    const expectedLanguage =
        canonicalKey === 'typescript'
            ? 'JavaScript'
            : getWandboxLabel(canonicalKey);

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
     * Order: prefer a stable (non-head) release over pre-release '-head'
     * compilers, then any compiler whitelisted in LANGUAGE_COMPILER_PREFERENCES,
     * finally the newest version overall. The compiler list returned by Wandbox
     * is used instead of hardcoding versions such as nodejs-20.17.0 or
     * cpython-3.12.7.
     */
    /*
     * Preference carve-outs for boxes Wandbox broke (verified 2026-09 with the
     * language's own starter AND minimal code - the chosen newest-stable
     * compiler fails on any input):
     *   python - prefer CPython over PyPy (the numeric version sort alone picks
     *            PyPy because 'v7.3.17' sorts above '3.14.0');
     *   csharp - dotnetcore-8's box dies with sandbox exit 153 (file-size
     *            limit) on any code; dotnetcore-6 and mono both work;
     *   scala  - scala-3.5's box dies with exit 126 on any code; 3.3/2.13 work.
     * If the preferred version disappears, the newest-stable fallback still
     * applies, so Wandbox housekeeping cannot break resolution.
     */
    const LANGUAGE_COMPILER_PREFERENCES: Record<string, string[]> = {
        python: ['cpython'],
        csharp: ['dotnetcore-6'],
        scala: ['scala-3.3']
    };

    const sortedCompilers = [...matchingCompilers].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        const headDifference =
            (/(^|-)head(-|$)/i.test(nameA) ? 1 : 0) -
            (/(^|-)head(-|$)/i.test(nameB) ? 1 : 0);
        if (headDifference !== 0) {
            return headDifference;
        }

        const preferences = LANGUAGE_COMPILER_PREFERENCES[canonicalKey] || [];
        const fallbackRank = preferences.length + 1;
        const rankA = preferences.findIndex((token) => nameA.includes(token));
        const rankB = preferences.findIndex((token) => nameB.includes(token));
        const normalizedA = rankA === -1 ? fallbackRank : rankA;
        const normalizedB = rankB === -1 ? fallbackRank : rankB;
        if (normalizedA !== normalizedB) {
            return normalizedA - normalizedB;
        }

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

    if (!isExecutableLanguage(normalizedLanguage)) {
        return {
            stdout: '',
            stderr: '',
            compilationError: null,
            runtimeError: `The language '${normalizedLanguage}' is not executable.`,
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
{ timeout: getRequestTimeoutMs(language) }
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
