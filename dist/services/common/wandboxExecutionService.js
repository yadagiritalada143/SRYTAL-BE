"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const languageUtils_1 = require("../../util/languageUtils");
const languageExecutionMap_1 = require("../../types/languageExecutionMap");
const WANDBOX_COMPILER_LIST_URL = 'https://wandbox.org/api/list.json';
const WANDBOX_COMPILE_URL = 'https://wandbox.org/api/compile.json';
const WANDBOX_REQUEST_TIMEOUT_MS = 60000;
const COMPILER_LIST_CACHE_TTL_MS = 10 * 60 * 1000;
let cachedCompilers = [];
let compilerListFetchedAt = 0;
let compilerListRequest = null;
let wandboxRateLimitUntil = 0;
const failedResult = (error, executionTime = 0, compileError = null, runtimeError = null, stderr = '', serviceError = null, retryAfterSeconds = null) => ({
    success: false,
    actualOutput: '',
    stderr,
    error,
    compileError,
    runtimeError,
    executionTime,
    serviceError,
    retryAfterSeconds
});
const getRetryAfterMilliseconds = (error) => {
    var _a, _b;
    const retryAfter = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b['retry-after'];
    if (typeof retryAfter === 'string') {
        const seconds = Number(retryAfter);
        if (Number.isFinite(seconds) && seconds >= 0) {
            return Math.min(seconds * 1000, 5 * 60 * 1000);
        }
        const retryAt = Date.parse(retryAfter);
        if (Number.isFinite(retryAt)) {
            return Math.max(0, Math.min(retryAt - Date.now(), 5 * 60 * 1000));
        }
    }
    return 60 * 1000;
};
const isCompiler = (value) => Boolean(value &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'language' in value &&
    typeof value.language === 'string');
const fetchCompilerList = async () => {
    const response = await axios_1.default.get(WANDBOX_COMPILER_LIST_URL, {
        timeout: WANDBOX_REQUEST_TIMEOUT_MS
    });
    if (!Array.isArray(response.data)) {
        throw new Error('INVALID_WANDBOX_COMPILER_LIST');
    }
    const compilers = response.data.filter(isCompiler);
    if (compilers.length === 0) {
        throw new Error('EMPTY_WANDBOX_COMPILER_LIST');
    }
    cachedCompilers = compilers;
    compilerListFetchedAt = Date.now();
    return compilers;
};
const getCompilerList = async () => {
    if (cachedCompilers.length > 0 &&
        Date.now() - compilerListFetchedAt < COMPILER_LIST_CACHE_TTL_MS) {
        return cachedCompilers;
    }
    if (!compilerListRequest) {
        compilerListRequest = fetchCompilerList().finally(() => {
            compilerListRequest = null;
        });
    }
    try {
        return await compilerListRequest;
    }
    catch (error) {
        if (cachedCompilers.length > 0) {
            console.warn('Wandbox compiler catalogue refresh failed; using cached entries.');
            return cachedCompilers;
        }
        throw error;
    }
};
const compareCompilerVersions = (left, right) => String(right.version || '').localeCompare(String(left.version || ''), undefined, { numeric: true, sensitivity: 'base' });
const selectCompiler = (languageLabel, compilers) => {
    let candidates = compilers.filter((compiler) => compiler.language === languageLabel);
    if (languageLabel === 'Python') {
        candidates = candidates.filter((compiler) => compiler.name.toLowerCase().includes('cpython'));
    }
    if (candidates.length === 0) {
        return undefined;
    }
    candidates.sort((left, right) => {
        const headPreference = Number(left.name.toLowerCase().includes('head')) -
            Number(right.name.toLowerCase().includes('head'));
        return headPreference || compareCompilerVersions(left, right);
    });
    return candidates[0];
};
const normalizeWandboxResponse = (response, executionTime) => {
    var _a;
    const actualOutput = typeof response.program_output === 'string'
        ? response.program_output
        : '';
    const stderr = typeof response.program_error === 'string'
        ? response.program_error
        : '';
    const compilerError = typeof response.compiler_error === 'string'
        ? response.compiler_error.trim()
        : '';
    const hasSuccessfulCompilerOutput = /\[(?:SuccessX|Success)\]/i.test(compilerError);
    const compilerDiagnostic = hasSuccessfulCompilerOutput ? '' : compilerError;
    const compilerOutput = typeof response.compiler_output === 'string'
        ? response.compiler_output.trim()
        : '';
    if (response.status === undefined || response.status === null) {
        return failedResult('Wandbox returned a response without a compiler status.', executionTime, null, null, stderr, 'REQUEST_ERROR');
    }
    const wandboxStatus = String(response.status);
    const compileDiagnostic = compilerDiagnostic ||
        (wandboxStatus !== '0' && !stderr.trim() ? compilerOutput : '');
    const syntaxDiagnostic = /syntaxerror|syntax error|parse error|unexpected token|expected .* before/i.test(stderr);
    if (compileDiagnostic || syntaxDiagnostic) {
        const compilerMessage = typeof response.compiler_message === 'string'
            ? response.compiler_message.trim()
            : '';
        const compileError = compileDiagnostic || compilerMessage || stderr.trim() ||
            `Wandbox compiler returned status ${wandboxStatus} without diagnostic output.`;
        return failedResult('Compilation failed.', executionTime, compileError, null, stderr);
    }
    const processStatus = (_a = response.program_status) !== null && _a !== void 0 ? _a : response.exit_code;
    const processStatusMissing = processStatus === undefined || processStatus === null;
    /**
     * A missing program status is only success when Wandbox also reported a
     * zero compiler status. A missing exit status combined with a non-zero
     * compiler status must be treated as a failure, otherwise empty diagnostic
     * fields would silently turn a failed run into `success: true`.
     */
    const nonZeroExit = (!processStatusMissing && String(processStatus) !== '0') ||
        (processStatusMissing && wandboxStatus !== '0');
    const timeout = /timed?\s*out|time.?limit|timeout/i.test(stderr) ||
        (typeof response.signal === 'string' && /timeout|killed/i.test(response.signal));
    const terminated = response.signal !== undefined &&
        response.signal !== null &&
        String(response.signal) !== '' &&
        String(response.signal) !== '0';
    if (timeout) {
        return {
            success: false,
            actualOutput,
            stderr,
            error: 'Execution timed out.',
            compileError: null,
            runtimeError: 'Execution timed out.',
            executionTime,
            serviceError: null,
            retryAfterSeconds: null
        };
    }
    if (terminated || nonZeroExit) {
        const runtimeError = stderr.trim() ||
            (terminated
                ? 'The program was terminated during execution.'
                : `The program exited with status ${String(processStatus !== null && processStatus !== void 0 ? processStatus : wandboxStatus)}.`);
        return {
            success: false,
            actualOutput,
            stderr,
            error: 'Program execution failed.',
            compileError: null,
            runtimeError,
            executionTime,
            serviceError: null,
            retryAfterSeconds: null
        };
    }
    return {
        success: true,
        actualOutput,
        stderr,
        error: null,
        compileError: null,
        runtimeError: null,
        executionTime,
        serviceError: null,
        retryAfterSeconds: null
    };
};
const getTransportFailure = (error, executionTime, context) => {
    var _a, _b, _c, _d, _e;
    if (axios_1.default.isAxiosError(error)) {
        const axiosError = error;
        console.error('[Wandbox Axios Error]', {
            taskId: context === null || context === void 0 ? void 0 : context.taskId,
            languageId: context === null || context === void 0 ? void 0 : context.languageId,
            languageName: context === null || context === void 0 ? void 0 : context.languageName,
            testCaseId: context === null || context === void 0 ? void 0 : context.testCaseId,
            message: axiosError.message,
            code: axiosError.code,
            status: (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status,
            statusText: (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.statusText,
            hasResponseData: ((_c = axiosError.response) === null || _c === void 0 ? void 0 : _c.data) !== undefined
        });
        if (axiosError.code === 'ECONNABORTED' ||
            axiosError.code === 'ETIMEDOUT' ||
            axiosError.message.toLowerCase().includes('timeout')) {
            return failedResult('Wandbox HTTP request timed out before an execution result was received.', executionTime, null, 'Wandbox HTTP request timed out.', '', 'REQUEST_ERROR');
        }
        if (((_d = axiosError.response) === null || _d === void 0 ? void 0 : _d.status) === 429) {
            const cooldownMilliseconds = getRetryAfterMilliseconds(axiosError);
            wandboxRateLimitUntil = Math.max(wandboxRateLimitUntil, Date.now() + cooldownMilliseconds);
            const retryAfterSeconds = Math.max(1, Math.ceil((wandboxRateLimitUntil - Date.now()) / 1000));
            console.warn('Wandbox rate limit reached; requests paused.', {
                retryAfterSeconds
            });
            return failedResult(`The code execution service is rate limited. Retry in about ${retryAfterSeconds} seconds.`, executionTime, null, null, '', 'RATE_LIMITED', retryAfterSeconds);
        }
        console.error('Wandbox request failed:', {
            status: (_e = axiosError.response) === null || _e === void 0 ? void 0 : _e.status,
            code: axiosError.code
        });
    }
    else {
        console.error('Wandbox request failed:', error instanceof Error ? error.name : 'UnknownError');
    }
    return failedResult('Wandbox request failed; see server diagnostics for the upstream response.', executionTime, null, null, '', 'REQUEST_ERROR');
};
const executeCode = async (language, sourceCode, input = '', context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    if (typeof language !== 'string' || !language.trim()) {
        return failedResult('A supported programming language is required.');
    }
    if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
        return failedResult('Source code is required.');
    }
    if (typeof input !== 'string') {
        return failedResult('Test-case input must be a string.');
    }
    const canonicalLanguage = (0, languageUtils_1.normalizeLanguage)(language);
    const languageEntry = canonicalLanguage
        ? languageExecutionMap_1.LANGUAGE_REGISTRY[canonicalLanguage]
        : undefined;
    if (!canonicalLanguage || !(languageEntry === null || languageEntry === void 0 ? void 0 : languageEntry.isExecutable)) {
        return failedResult('Unsupported or invalid programming language.');
    }
    if (Date.now() < wandboxRateLimitUntil) {
        const retryAfterSeconds = Math.ceil((wandboxRateLimitUntil - Date.now()) / 1000);
        return failedResult(`The code execution service is rate limited. Retry in about ${retryAfterSeconds} seconds.`, 0, null, null, '', 'RATE_LIMITED', retryAfterSeconds);
    }
    const languageLabel = (0, languageUtils_1.getWandboxLabel)(canonicalLanguage);
    let compilers;
    try {
        compilers = await getCompilerList();
    }
    catch (error) {
        return getTransportFailure(error, 0, context);
    }
    const compiler = selectCompiler(languageLabel, compilers);
    if (!compiler) {
        return failedResult('No compatible compiler is currently available for this language.', 0, null, null, '', 'REQUEST_ERROR');
    }
    const startedAt = Date.now();
    const javaRunnerSource = context === null || context === void 0 ? void 0 : context.javaRunnerSource;
    const javaEntryPoint = (context === null || context === void 0 ? void 0 : context.javaEntryPoint) || 'Solution';
    const javaProgramEntry = javaRunnerSource
        ? 'Main.main(args);'
        : `${javaEntryPoint}.main(args);`;
    const javaWandboxEntrySource = `public class prog { public static void main(String[] args) throws Exception { ${javaProgramEntry} } }`;
    const requestPayload = Object.assign(Object.assign({ compiler: compiler.name, code: canonicalLanguage === 'java' ? javaWandboxEntrySource : sourceCode }, (canonicalLanguage === 'java'
        ? {
            codes: [
                { file: 'Solution.java', code: sourceCode },
                ...(javaRunnerSource
                    ? [{ file: 'Main.java', code: javaRunnerSource }]
                    : [])
            ]
        }
        : {})), { stdin: javaRunnerSource ? '' : input, 'compiler-option-raw': '', 'runtime-option-raw': '', save: false });
    console.info('[Wandbox Request]', {
        taskId: context === null || context === void 0 ? void 0 : context.taskId,
        languageId: (context === null || context === void 0 ? void 0 : context.languageId) || language,
        languageName: (context === null || context === void 0 ? void 0 : context.languageName) || languageEntry.displayName,
        wandboxCompiler: compiler.name,
        testCaseId: context === null || context === void 0 ? void 0 : context.testCaseId,
        testInputLength: (_b = (_a = context === null || context === void 0 ? void 0 : context.testCaseInput) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0,
        stdinLength: requestPayload.stdin.length,
        generatedRunner: Boolean(javaRunnerSource),
        runnerClassName: javaRunnerSource ? 'Main' : null,
        entryPointClass: canonicalLanguage === 'java' ? 'prog' : null,
        javaEntryPoint: canonicalLanguage === 'java' ? javaEntryPoint : null,
        studentSourceContainsMain: canonicalLanguage === 'java'
            ? /\bstatic\s+void\s+main\s*\(/.test(sourceCode)
            : undefined,
        generatedRunnerContainsMain: Boolean(javaRunnerSource),
        endpoint: WANDBOX_COMPILE_URL,
        method: 'POST',
        request: Object.assign(Object.assign(Object.assign({}, requestPayload), { stdin: '[omitted]', code: '[omitted]' }), (requestPayload.codes
            ? {
                codes: requestPayload.codes.map(({ file, code }) => ({
                    file,
                    code: '[omitted]',
                    codeLength: code.length,
                    codeHash: (0, crypto_1.createHash)('sha256').update(code).digest('hex')
                }))
            }
            : {})),
        code: '[omitted]',
        codeLength: sourceCode.length,
        codeHash: (0, crypto_1.createHash)('sha256').update(sourceCode).digest('hex'),
        javaRunnerHash: javaRunnerSource
            ? (0, crypto_1.createHash)('sha256').update(javaRunnerSource).digest('hex')
            : null,
        compilerOptionRaw: requestPayload['compiler-option-raw'],
        runtimeOptionRaw: requestPayload['runtime-option-raw'],
        save: requestPayload.save,
        timeoutMs: WANDBOX_REQUEST_TIMEOUT_MS
    });
    try {
        const response = await axios_1.default.post(WANDBOX_COMPILE_URL, requestPayload, { timeout: WANDBOX_REQUEST_TIMEOUT_MS });
        console.info('[Wandbox Response]', {
            taskId: context === null || context === void 0 ? void 0 : context.taskId,
            languageId: (context === null || context === void 0 ? void 0 : context.languageId) || language,
            languageName: (context === null || context === void 0 ? void 0 : context.languageName) || languageEntry.displayName,
            wandboxCompiler: compiler.name,
            testCaseId: context === null || context === void 0 ? void 0 : context.testCaseId,
            httpStatus: response.status,
            httpStatusText: response.statusText,
            compileStatus: (_d = (_c = response.data) === null || _c === void 0 ? void 0 : _c.status) !== null && _d !== void 0 ? _d : null,
            programStatus: (_h = (_f = (_e = response.data) === null || _e === void 0 ? void 0 : _e.program_status) !== null && _f !== void 0 ? _f : (_g = response.data) === null || _g === void 0 ? void 0 : _g.exit_code) !== null && _h !== void 0 ? _h : null,
            signal: (_k = (_j = response.data) === null || _j === void 0 ? void 0 : _j.signal) !== null && _k !== void 0 ? _k : null,
            hasCompilerError: Boolean((_l = response.data) === null || _l === void 0 ? void 0 : _l.compiler_error),
            hasProgramError: Boolean((_m = response.data) === null || _m === void 0 ? void 0 : _m.program_error),
            programOutputLength: typeof ((_o = response.data) === null || _o === void 0 ? void 0 : _o.program_output) === 'string'
                ? response.data.program_output.length
                : 0
        });
        return normalizeWandboxResponse(response.data || {}, Date.now() - startedAt);
    }
    catch (error) {
        return getTransportFailure(error, Date.now() - startedAt, context);
    }
};
exports.default = { executeCode };
