"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const codingTaskTestCaseModel_1 = __importDefault(require("../../model/codingTaskTestCaseModel"));
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const generateCourseTaskTestCasesService_1 = __importDefault(require("./generateCourseTaskTestCasesService"));
const reviewCourseTaskCodeService_1 = __importDefault(require("./reviewCourseTaskCodeService"));
const wandboxExecutionService_1 = __importDefault(require("./wandboxExecutionService"));
const languageUtils_1 = require("../../util/languageUtils");
const codingTaskReview_1 = require("../../util/codingTaskReview");
const languageExecutionMap_1 = require("../../types/languageExecutionMap");
const TEST_CASE_GENERATION_WAIT_TIMEOUT_MS = 45000;
const TEST_CASE_GENERATION_POLL_INTERVAL_MS = 250;
/**
 * Compare outputs by normalizing line endings and tolerating a single trailing
 * newline, while preserving meaningful leading/trailing whitespace. A second
 * trailing newline is significant and is NOT ignored.
 */
const normalizeOutput = (value) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.replace(/\r\n?/g, '\n').replace(/\n$/, '');
};
const getExecutionStatus = (passed, compileError, runtimeError, serviceError, executionError) => {
    if (passed) {
        return 'PASSED';
    }
    if (runtimeError && /timed?\s*out|time.?limit|timeout/i.test(runtimeError)) {
        return 'TIMEOUT';
    }
    if (serviceError) {
        return 'REQUEST_ERROR';
    }
    if (compileError) {
        return 'COMPILE_ERROR';
    }
    if (runtimeError) {
        return 'RUNTIME_ERROR';
    }
    return executionError ? 'EXECUTION_ERROR' : 'WRONG_OUTPUT';
};
/**
 * Resolve a user-supplied language to its canonical runtime key. Accepts both a
 * name/alias (e.g. 'Python', 'JS', 'c++') and a programming-languages `_id`,
 * since the language picker and the boilerplate endpoint identify a language
 * by its Mongo ObjectId while the execution registry keys off the canonical
 * slug. Returns undefined when the language is unknown or inactive.
 */
const resolveCanonicalLanguage = async (language) => {
    const direct = (0, languageUtils_1.normalizeLanguage)(language);
    if (direct) {
        return direct;
    }
    if (mongoose_1.Types.ObjectId.isValid(language)) {
        const record = await programmingLanguagesModel_1.default.findOne({
            _id: language,
            isActive: true
        })
            .select('canonicalKey')
            .lean();
        return (record === null || record === void 0 ? void 0 : record.canonicalKey)
            ? (0, languageUtils_1.normalizeLanguage)(record.canonicalKey)
            : undefined;
    }
    return undefined;
};
const loadCompletedTestCases = async (taskId) => codingTaskTestCaseModel_1.default.findOne({
    taskId,
    status: 'COMPLETED'
})
    .select('taskId status testCases')
    .lean();
const waitForGeneratedTestCases = async (taskId) => {
    const deadline = Date.now() + TEST_CASE_GENERATION_WAIT_TIMEOUT_MS;
    while (Date.now() < deadline) {
        const testCaseSet = await codingTaskTestCaseModel_1.default.findOne({ taskId })
            .select('taskId status testCases')
            .lean();
        if ((testCaseSet === null || testCaseSet === void 0 ? void 0 : testCaseSet.status) === 'COMPLETED') {
            return testCaseSet;
        }
        if ((testCaseSet === null || testCaseSet === void 0 ? void 0 : testCaseSet.status) === 'FAILED') {
            throw new Error('TEST_CASES_GENERATION_FAILED');
        }
        await new Promise((resolve) => setTimeout(resolve, TEST_CASE_GENERATION_POLL_INTERVAL_MS));
    }
    throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
};
/**
 * Locate the entry-point function for a JavaScript solution. When `callableMode`
 * is false the function is treated as callable only when the source does not
 * already read stdin / write stdout itself (legacy callable tasks).
 */
const getJavaScriptFunctionName = (baseBoilerplate, sourceCode, callableMode = false) => {
    const functionPattern = /function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/;
    const functionDeclaration = functionPattern.exec(baseBoilerplate) ||
        functionPattern.exec(sourceCode);
    const functionName = (functionDeclaration === null || functionDeclaration === void 0 ? void 0 : functionDeclaration[1]) || (functionDeclaration === null || functionDeclaration === void 0 ? void 0 : functionDeclaration[2]);
    if (!functionName) {
        return null;
    }
    const implementationPattern = new RegExp(`(?:function\\s+${functionName}\\s*\\(|(?:const|let|var)\\s+${functionName}\\s*=)`, 'm');
    if (!implementationPattern.test(sourceCode)) {
        return null;
    }
    if (callableMode) {
        return functionName;
    }
    const includesProgramInput = /\b(?:readFileSync|createInterface)\s*\(|\bprocess\.stdin\b/.test(sourceCode);
    const includesProgramOutput = /\b(?:console\.log|process\.stdout\.write)\s*\(/.test(sourceCode);
    return includesProgramInput || includesProgramOutput ? null : functionName;
};
const createJavaScriptFunctionHarness = (sourceCode, functionName) => [
    sourceCode,
    '',
    'const __taskInputText = require("fs").readFileSync(0, "utf8").replace(/\\r?\\n$/, "");',
    'let __taskArguments;',
    'try {',
    '  const __parsedInput = JSON.parse(__taskInputText);',
    '  __taskArguments = Array.isArray(__parsedInput) ? __parsedInput : [__parsedInput];',
    '} catch {',
    '  __taskArguments = [__taskInputText];',
    '}',
    `Promise.resolve(${functionName}(...__taskArguments)).then((__taskResult) => {`,
    '  const __taskOutput = typeof __taskResult === "string"',
    '    ? __taskResult',
    '    : __taskResult === undefined ? "" : JSON.stringify(__taskResult);',
    '  process.stdout.write(__taskOutput);',
    '}).catch((__taskError) => {',
    '  console.error(__taskError);',
    '  process.exitCode = 1;',
    '});'
].join('\n');
const prepareSourceCodeForExecution = (language, executionMode, baseBoilerplate, sourceCode) => {
    if (language !== 'javascript') {
        return sourceCode;
    }
    if (executionMode !== 'CALLABLE' && executionMode !== 'UNCONFIGURED') {
        return sourceCode;
    }
    const functionName = getJavaScriptFunctionName(baseBoilerplate, sourceCode, executionMode === 'CALLABLE');
    if (!functionName) {
        if (executionMode === 'CALLABLE') {
            throw new Error('CALLABLE_ENTRY_POINT_NOT_FOUND');
        }
        return sourceCode;
    }
    return createJavaScriptFunctionHarness(sourceCode, functionName);
};
const getJavaMethod = (starterCode, sourceCode) => {
    var _a, _b;
    const methodPattern = /\bpublic\s+(?:(?:static|final|synchronized)\s+)*([\w.$<>?,\s]+(?:\[\])*)\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g;
    const candidates = [starterCode, sourceCode];
    for (const candidate of candidates) {
        const className = ((_a = candidate.match(/\bpublic\s+class\s+([A-Za-z_$][\w$]*)/)) === null || _a === void 0 ? void 0 : _a[1]) ||
            ((_b = sourceCode.match(/\bclass\s+([A-Za-z_$][\w$]*)/)) === null || _b === void 0 ? void 0 : _b[1]);
        let match;
        while ((match = methodPattern.exec(candidate)) !== null) {
            const name = match[2];
            if (name === 'main') {
                continue;
            }
            const parameters = match[3].trim()
                ? match[3].split(',').map((parameter) => {
                    const normalized = parameter.trim()
                        .replace(/^(?:final\s+|@[\w.]+(?:\([^)]*\))?\s*)+/g, '')
                        .replace(/\s+/g, ' ');
                    const parts = normalized.split(' ');
                    return {
                        type: parts.slice(0, -1).join(' ').replace(/\s+/g, ''),
                        name: parts[parts.length - 1]
                    };
                })
                : [];
            if (parameters.some((parameter) => !parameter.type || !parameter.name)) {
                continue;
            }
            return {
                className: className || 'Solution',
                name,
                returnType: match[1].trim().replace(/\s+/g, ''),
                parameters
            };
        }
    }
    return null;
};
const parseJavaCaseInput = (input) => {
    var _a;
    const trimmed = input.trim();
    if (!trimmed) {
        return [];
    }
    try {
        return JSON.parse(trimmed);
    }
    catch (_b) {
        const arrayLiteral = (_a = trimmed.match(/\[[\s\S]*\]/)) === null || _a === void 0 ? void 0 : _a[0];
        if (arrayLiteral) {
            try {
                return JSON.parse(arrayLiteral);
            }
            catch (_c) {
                // Fall through to whitespace-delimited input parsing.
            }
        }
    }
    return trimmed.split(/\s+/).map((value) => /^[-+]?\d+$/.test(value)
        ? Number(value)
        : /^[-+]?(?:\d+\.\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value)
            ? Number(value)
            : value);
};
const javaStringLiteral = (value) => JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
const javaValueExpression = (type, value) => {
    const normalizedType = type.replace(/\s+/g, '');
    const arrayType = normalizedType.endsWith('[]');
    if (arrayType) {
        const componentType = normalizedType.slice(0, -2);
        const items = Array.isArray(value) ? value : [value];
        return `new ${componentType}[]{${items.map((item) => javaValueExpression(componentType, item)).join(', ')}}`;
    }
    if (normalizedType.startsWith('List<') || normalizedType.startsWith('Collection<')) {
        const itemType = normalizedType.slice(normalizedType.indexOf('<') + 1, -1);
        const items = Array.isArray(value) ? value : [value];
        return `java.util.Arrays.asList(${items.map((item) => javaValueExpression(itemType, item)).join(', ')})`;
    }
    if (normalizedType.startsWith('Set<')) {
        const itemType = normalizedType.slice(normalizedType.indexOf('<') + 1, -1);
        const items = Array.isArray(value) ? value : [value];
        return `new java.util.LinkedHashSet<>(java.util.Arrays.asList(${items.map((item) => javaValueExpression(itemType, item)).join(', ')}))`;
    }
    if (normalizedType === 'String' ||
        normalizedType === 'char' ||
        normalizedType === 'Character') {
        const text = String(value !== null && value !== void 0 ? value : '');
        return normalizedType === 'String'
            ? javaStringLiteral(text)
            : `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    }
    if (normalizedType === 'boolean' || normalizedType === 'Boolean') {
        return value === true || value === 'true' ? 'true' : 'false';
    }
    if (normalizedType === 'long' || normalizedType === 'Long') {
        return `${String(value)}L`;
    }
    if (normalizedType === 'float' || normalizedType === 'Float') {
        return `${String(value)}f`;
    }
    if (normalizedType === 'double' || normalizedType === 'Double') {
        return String(value);
    }
    if (normalizedType === 'int' ||
        normalizedType === 'Integer' ||
        normalizedType === 'short' ||
        normalizedType === 'Short' ||
        normalizedType === 'byte' ||
        normalizedType === 'Byte') {
        return String(value);
    }
    throw new Error(`UNSUPPORTED_JAVA_TEST_PARAMETER_TYPE:${type}`);
};
const getJavaMethodArguments = (method, input) => {
    const parsedInput = parseJavaCaseInput(input);
    let values;
    if (method.parameters.length === 1 &&
        (Array.isArray(parsedInput) || parsedInput === null || typeof parsedInput !== 'object')) {
        values = [parsedInput];
    }
    else if (Array.isArray(parsedInput)) {
        values = parsedInput;
    }
    else if (parsedInput && typeof parsedInput === 'object') {
        const inputObject = parsedInput;
        values = method.parameters.map((parameter) => inputObject[parameter.name]);
    }
    else {
        values = [parsedInput];
    }
    if (values.length !== method.parameters.length) {
        throw new Error('INVALID_JAVA_METHOD_TEST_INPUT');
    }
    return method.parameters.map((parameter, index) => javaValueExpression(parameter.type, values[index]));
};
const createJavaMethodRunner = (method, input) => {
    const argumentsList = getJavaMethodArguments(method, input).join(', ');
    const invocation = `new ${method.className}().${method.name}(${argumentsList})`;
    const callStatement = method.returnType === 'void'
        ? `${invocation};`
        : `var result = ${invocation};`;
    const outputStatement = method.returnType === 'void'
        ? ''
        : method.returnType.endsWith('[]')
            ? `System.out.println(${method.returnType.endsWith('[][]')
                ? 'java.util.Arrays.deepToString(result)'
                : 'java.util.Arrays.toString(result)'});`
            : 'System.out.println(result);';
    return [
        'import java.util.*;',
        'public class Main {',
        '  public static void main(String[] args) {',
        `    ${callStatement}`,
        ...(outputStatement ? [`    ${outputStatement}`] : []),
        '  }',
        '}'
    ].join('\n');
};
/**
 * Hidden cases are still executed and compared on the backend, but never echo
 * their name, input, expected output, actual output or raw diagnostics back to
 * the client. Visible cases keep the full API contract.
 */
const toTestResult = (testCase, status, passed, details) => {
    if (testCase.isHidden === true) {
        return Object.assign({ testCaseId: testCase.id, name: 'Hidden test case', status,
            passed, isHidden: true }, (details.skipped ? { skipped: true } : {}));
    }
    return Object.assign({ testCaseId: testCase.id, name: testCase.name, status,
        passed, expectedOutput: details.expectedOutput, actualOutput: details.actualOutput, error: details.error }, (details.skipped ? { skipped: true } : {}));
};
/**
 * Run the latest source code against every saved test case for a CODE task.
 *
 * All stored cases are executed sequentially on the backend and compared with
 * their saved expected output. After execution the same submitted source and
 * the sanitized execution summary are sent for advisory AI review so the user
 * gets fresh feedback on every Run/Re-run. Submission is deliberately NOT
 * performed here; pass/fail and eligibility remain driven solely by execution.
 */
const runCourseTaskCode = async (taskId, language, sourceCode, userId) => {
    var _a;
    if (!mongoose_1.Types.ObjectId.isValid(taskId)) {
        throw new Error('INVALID_TASK_ID');
    }
    if (!userId || !mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }
    if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
        throw new Error('INVALID_SOURCE_CODE');
    }
    /**
     * Resolve and validate the language BEFORE any task lookup: it must be
     * supported by the static execution registry AND present and active in the
     * programming-languages collection.
     */
    const canonicalLanguage = await resolveCanonicalLanguage(language);
    const languageEntry = canonicalLanguage
        ? languageExecutionMap_1.LANGUAGE_REGISTRY[canonicalLanguage]
        : undefined;
    if (!canonicalLanguage || !(languageEntry === null || languageEntry === void 0 ? void 0 : languageEntry.isExecutable)) {
        throw new Error('INVALID_LANGUAGE');
    }
    const languageRecord = await programmingLanguagesModel_1.default.findOne({
        canonicalKey: canonicalLanguage,
        isActive: true
    })
        .select('_id')
        .lean();
    if (!languageRecord) {
        throw new Error('INVALID_LANGUAGE');
    }
    const task = await courseTaskModel_1.default.findById(taskId)
        .select('type taskName taskDescription moduleId executionMode baseBoilerplate starterCode')
        .lean();
    if (!task) {
        throw new Error('COURSE_TASK_NOT_FOUND');
    }
    if (String(task.type || '').toUpperCase() !== 'CODE') {
        throw new Error('NOT_CODING_TASK');
    }
    const taskDescription = String(task.taskDescription || '').trim();
    if (!taskDescription) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }
    const executionMode = (task.executionMode || 'UNCONFIGURED');
    if (executionMode === 'CALLABLE' &&
        canonicalLanguage !== 'javascript' &&
        canonicalLanguage !== 'java') {
        throw new Error('CALLABLE_EXECUTION_UNSUPPORTED');
    }
    /**
     * Authorization: the task must belong to a course assigned to the user.
     */
    const parentModule = await coursemoduleModel_1.default.findById(task.moduleId)
        .select('courseId')
        .lean();
    if (!(parentModule === null || parentModule === void 0 ? void 0 : parentModule.courseId)) {
        throw new Error('TASK_NOT_ASSIGNED');
    }
    const assignment = await courseAssignmentModel_1.default.findOne({
        employeeId: userId,
        courseId: parentModule.courseId
    })
        .select('_id')
        .lean();
    if (!assignment) {
        throw new Error('TASK_NOT_ASSIGNED');
    }
    /**
     * Reuse saved test cases. Only generate when no COMPLETED set exists yet
     * (or wait for an in-flight generation), never regenerate valid cases on a
     * normal Run request.
     */
    let testCaseSet = await codingTaskTestCaseModel_1.default.findOne({ taskId })
        .select('taskId status testCases')
        .lean();
    if ((testCaseSet === null || testCaseSet === void 0 ? void 0 : testCaseSet.status) === 'GENERATING') {
        testCaseSet = await waitForGeneratedTestCases(taskId);
    }
    else if ((testCaseSet === null || testCaseSet === void 0 ? void 0 : testCaseSet.status) !== 'COMPLETED' ||
        !Array.isArray(testCaseSet.testCases) ||
        testCaseSet.testCases.length === 0) {
        try {
            await generateCourseTaskTestCasesService_1.default.generateCourseTaskTestCases(taskId, userId);
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === 'TEST_CASES_GENERATION_IN_PROGRESS') {
                testCaseSet = await waitForGeneratedTestCases(taskId);
            }
            else {
                throw error;
            }
        }
        if ((testCaseSet === null || testCaseSet === void 0 ? void 0 : testCaseSet.status) !== 'COMPLETED') {
            testCaseSet = await loadCompletedTestCases(taskId);
        }
    }
    if (!testCaseSet ||
        testCaseSet.status !== 'COMPLETED' ||
        !Array.isArray(testCaseSet.testCases) ||
        testCaseSet.testCases.length === 0) {
        throw new Error('TEST_CASES_NOT_GENERATED');
    }
    const javaMethod = executionMode === 'CALLABLE' && canonicalLanguage === 'java'
        ? resolveJavaMethod(task, String(languageRecord._id), sourceCode)
        : null;
    const executableSourceCode = prepareSourceCodeForExecution(canonicalLanguage, executionMode, String(task.baseBoilerplate || ''), sourceCode);
    const testResults = [];
    let compilationSuccessful = false;
    let compilationFailed = false;
    let infrastructureError = null;
    let retryAfterSeconds = null;
    /**
     * Execute every saved case sequentially through the existing Wandbox
     * integration.
     */
    for (const testCase of testCaseSet.testCases) {
        if (compilationFailed || infrastructureError) {
            testResults.push(toTestResult(testCase, compilationFailed ? 'COMPILE_ERROR' : 'REQUEST_ERROR', false, {
                expectedOutput: testCase.expectedOutput,
                actualOutput: '',
                error: infrastructureError ||
                    'Not run because the submitted code failed to compile.',
                skipped: true
            }));
            continue;
        }
        let javaRunnerSource;
        if (javaMethod) {
            javaRunnerSource = createJavaMethodRunner(javaMethod, testCase.input);
        }
        const execution = await wandboxExecutionService_1.default.executeCode(canonicalLanguage, executableSourceCode, testCase.input, Object.assign({ taskId, languageId: language, languageName: languageExecutionMap_1.LANGUAGE_REGISTRY[canonicalLanguage].displayName, testCaseId: testCase.id, testCaseInput: testCase.input }, (javaRunnerSource
            ? {
                javaRunnerSource,
                javaEntryPoint: 'Main'
            }
            : {})));
        const compileError = execution.compileError;
        if (execution.serviceError) {
            infrastructureError =
                execution.error ||
                    'The code execution service is unavailable.';
            retryAfterSeconds = execution.retryAfterSeconds;
        }
        if (compileError) {
            compilationSuccessful = false;
            compilationFailed = true;
        }
        else if (!execution.serviceError) {
            compilationSuccessful = true;
        }
        const passed = !execution.serviceError &&
            !compileError &&
            execution.success &&
            normalizeOutput(execution.actualOutput) ===
                normalizeOutput(testCase.expectedOutput);
        testResults.push(toTestResult(testCase, getExecutionStatus(passed, compileError, execution.runtimeError, execution.serviceError, execution.error), passed, {
            expectedOutput: testCase.expectedOutput,
            actualOutput: execution.actualOutput,
            error: passed
                ? null
                : execution.serviceError ||
                    compileError ||
                    execution.runtimeError ||
                    execution.error,
            skipped: Boolean(execution.serviceError)
        }));
    }
    const passedTests = testResults.filter((result) => result.passed).length;
    const failedTests = testResults.length - passedTests;
    const allTestsPassed = compilationSuccessful &&
        !infrastructureError &&
        testResults.every((result) => result.passed);
    /**
     * Fresh advisory review on every Run/Re-run, bound to this exact source and
     * these execution results. Hidden cases are sanitized before leaving the
     * backend. Review is best-effort: a provider failure only yields an
     * `evaluationError` and never alters the authoritative execution results.
     */
    let evaluation = null;
    let evaluationError = null;
    try {
        const taskStatement = [
            task.taskName ? `TASK NAME: ${task.taskName}` : '',
            `TASK DESCRIPTION: ${taskDescription}`
        ]
            .filter(Boolean)
            .join('\n');
        const review = await reviewCourseTaskCodeService_1.default.reviewCourseTaskCode(taskStatement, canonicalLanguage, sourceCode, (0, codingTaskReview_1.sanitizeTestResultsForReview)(testResults), userId);
        evaluation = (_a = review.feedback) !== null && _a !== void 0 ? _a : null;
        evaluationError = review.feedback
            ? null
            : review.error ||
                'Code review feedback is temporarily unavailable.';
    }
    catch (error) {
        console.error('Course task code review failed:', error instanceof Error ? error.message : 'UnknownError');
        evaluation = null;
        evaluationError = 'Code review feedback is temporarily unavailable.';
    }
    return {
        codingTaskId: taskId,
        language: canonicalLanguage,
        execution: {
            compilationSuccessful,
            infrastructureError,
            retryAfterSeconds,
            totalTests: testResults.length,
            passedTests,
            failedTests,
            allTestsPassed,
            testResults
        },
        evaluation,
        evaluationError,
        canSubmit: allTestsPassed
    };
};
const resolveJavaMethod = (task, languageId, sourceCode) => {
    var _a;
    const languageStarter = (_a = (task.starterCode || []).find((starter) => String(starter.languageId) === String(languageId))) === null || _a === void 0 ? void 0 : _a.code;
    const javaMethod = getJavaMethod(String(languageStarter || task.baseBoilerplate || ''), sourceCode);
    if (!javaMethod) {
        throw new Error('CALLABLE_ENTRY_POINT_NOT_FOUND');
    }
    return javaMethod;
};
exports.default = {
    runCourseTaskCode,
    normalizeOutput,
    getExecutionStatus,
    getJavaScriptFunctionName,
    createJavaScriptFunctionHarness,
    prepareSourceCodeForExecution,
    getJavaMethod,
    parseJavaCaseInput,
    javaValueExpression,
    getJavaMethodArguments,
    createJavaMethodRunner
};
