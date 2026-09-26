"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WANDBOX_COMPILER_MAP = void 0;
const axios_1 = __importDefault(require("axios"));
const typescript_1 = __importDefault(require("typescript"));
const languageExecutionMap_1 = require("../../types/languageExecutionMap");
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';
const WANDBOX_REQUEST_TIMEOUT_MS = 20000;
const WANDBOX_MAX_ATTEMPTS = 3;
const WANDBOX_RETRY_DELAY_MS = 500;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Wandbox compilers for the languages we expose. Wandbox's public API needs no
 * API key or IP whitelist, so code execution works locally and on serverless
 * hosting (Vercel) without running any extra infrastructure. TypeScript is
 * transpiled to plain JavaScript first and then run on the Node.js runtime.
 */
exports.WANDBOX_COMPILER_MAP = {
    javascript: 'nodejs-24.21.0',
    python: 'cpython-3.12.7',
    typescript: 'nodejs-24.21.0',
    java: 'openjdk-jdk-21+35',
    c: 'gcc-13.2.0-c',
    'c++': 'gcc-13.2.0'
};
/**
 * Reusable executor. Runs the user's submitted code (plus an optional stdin
 * input) on the Wandbox execution API and normalizes the outcome into
 * stdout / stderr / compilation error / runtime error / status. Nothing is
 * executed on this server.
 */
const executeCode = async ({ language, code, input }) => {
    const normalizedLanguage = languageExecutionMap_1.LANGUAGE_MAP[(language || '').trim().toLowerCase()];
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
const transpileTypeScript = (sourceCode) => {
    const result = typescript_1.default.transpileModule(sourceCode, {
        compilerOptions: {
            module: typescript_1.default.ModuleKind.CommonJS,
            target: typescript_1.default.ScriptTarget.ES2017,
            esModuleInterop: true,
            strict: false
        },
        reportDiagnostics: true
    });
    const errors = (result.diagnostics || []).filter((diagnostic) => diagnostic.category === typescript_1.default.DiagnosticCategory.Error);
    if (errors.length > 0) {
        const messages = errors
            .map((diagnostic) => typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
            .join('\n');
        return { code: '', diagnostics: messages };
    }
    return { code: result.outputText, diagnostics: null };
};
const executeOnWandbox = async ({ language, code, input }) => {
    var _a, _b, _c;
    const startedAt = Date.now();
    const compiler = exports.WANDBOX_COMPILER_MAP[language];
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
        wandboxCode = code.replace(/\bpublic\s+class\s+Main\b/g, 'public class prog');
    }
    else if (language === 'typescript') {
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
    let lastError = null;
    for (let attempt = 1; attempt <= WANDBOX_MAX_ATTEMPTS; attempt++) {
        try {
            const response = await axios_1.default.post(WANDBOX_URL, {
                code: wandboxCode,
                compiler,
                stdin: input !== null && input !== void 0 ? input : '',
                'compiler-option-raw': '',
                save: false
            }, { timeout: WANDBOX_REQUEST_TIMEOUT_MS });
            const executionTimeMs = Date.now() - startedAt;
            return normalizeWandboxResponse(response.data || {}, executionTimeMs);
        }
        catch (error) {
            lastError = error;
            if (isTransientWandboxError(error) && attempt < WANDBOX_MAX_ATTEMPTS) {
                await wait(WANDBOX_RETRY_DELAY_MS * attempt);
                continue;
            }
            break;
        }
    }
    const executionTimeMs = Date.now() - startedAt;
    if (lastError.code === 'ECONNABORTED' ||
        ((_a = lastError.response) === null || _a === void 0 ? void 0 : _a.status) === 408 ||
        String(lastError.message).includes('timeout')) {
        return {
            stdout: '',
            stderr: '',
            compilationError: null,
            runtimeError: 'Execution timed out on the code execution server.',
            status: 'TIME_LIMIT_EXCEEDED',
            executionTimeMs
        };
    }
    const upstreamMessage = (_c = (_b = lastError.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message;
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
    console.error(`Code execution service error: ${lastError.message}`);
    return {
        stdout: '',
        stderr: lastError.message || 'Unexpected error while executing the code.',
        compilationError: null,
        runtimeError: null,
        status: 'EXECUTION_ERROR',
        executionTimeMs
    };
};
/**
 * Converts a successful Wandbox response into the normalized execution result.
 */
const normalizeWandboxResponse = (data, executionTimeMs) => {
    var _a;
    const stdout = (data.program_output || data.program || '');
    const stderr = (data.program_error || '');
    const compilerOutput = (data.compiler_output || '').trim();
    const compilationError = (data.compiler_error || '').trim() || null;
    const statusCode = String((_a = data.status) !== null && _a !== void 0 ? _a : '0');
    if (compilationError ||
        (statusCode !== '0' && !stdout && !stderr && compilerOutput)) {
        return {
            stdout: '',
            stderr: compilerOutput,
            compilationError: compilationError || compilerOutput || 'Compilation failed, please check your code.',
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
const isTransientWandboxError = (error) => {
    var _a;
    if (!error) {
        return false;
    }
    const status = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status;
    const code = error.code;
    return (status === 408 ||
        status === 429 ||
        (typeof status === 'number' && status >= 500) ||
        code === 'ECONNABORTED' ||
        code === 'ECONNRESET' ||
        code === 'ENOTFOUND' ||
        code === 'EAI_AGAIN' ||
        code === 'ETIMEDOUT' ||
        String(error.message).includes('timeout'));
};
exports.default = { executeCode };
