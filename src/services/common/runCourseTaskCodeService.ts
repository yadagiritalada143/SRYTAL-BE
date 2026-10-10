import { Types } from 'mongoose';

import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../model/codingTaskTestCaseModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';

import generateCourseTaskTestCasesService from './generateCourseTaskTestCasesService';
import reviewCourseTaskCodeService from './reviewCourseTaskCodeService';
import wandboxExecutionService from './wandboxExecutionService';

import { ICodingTaskTestCase } from '../../interfaces/codingTaskTestCase';
import { ICodingTaskCodeReview } from '../../interfaces/codingTaskCodeReview';
import {
    IRunCourseTaskCodeResponse,
    IRunCourseTaskCodeTestResult
} from '../../interfaces/runCourseTaskCode';
import { normalizeLanguage } from '../../util/languageUtils';
import { sanitizeTestResultsForReview } from '../../util/codingTaskReview';
import { LANGUAGE_REGISTRY } from '../../types/languageExecutionMap';

const TEST_CASE_GENERATION_WAIT_TIMEOUT_MS = 45000;
const TEST_CASE_GENERATION_POLL_INTERVAL_MS = 250;

type ExecutionMode = 'CALLABLE' | 'STDIN' | 'UNCONFIGURED';

/**
 * Compare outputs by normalizing line endings and tolerating a single trailing
 * newline, while preserving meaningful leading/trailing whitespace. A second
 * trailing newline is significant and is NOT ignored.
 */
const normalizeOutput = (value: unknown): string => {
    if (typeof value !== 'string') {
        return '';
    }

    return value.replace(/\r\n?/g, '\n').replace(/\n$/, '');
};

const getExecutionStatus = (
    passed: boolean,
    compileError: string | null,
    runtimeError: string | null,
    serviceError: string | null,
    executionError: string | null
): IRunCourseTaskCodeTestResult['status'] => {
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

const loadCompletedTestCases = async (taskId: string) =>
    CodingTaskTestCaseModel.findOne({
        taskId,
        status: 'COMPLETED'
    })
        .select('taskId status testCases')
        .lean();

const waitForGeneratedTestCases = async (taskId: string) => {
    const deadline = Date.now() + TEST_CASE_GENERATION_WAIT_TIMEOUT_MS;

    while (Date.now() < deadline) {
        const testCaseSet = await CodingTaskTestCaseModel.findOne({ taskId })
            .select('taskId status testCases')
            .lean();

        if (testCaseSet?.status === 'COMPLETED') {
            return testCaseSet;
        }
        if (testCaseSet?.status === 'FAILED') {
            throw new Error('TEST_CASES_GENERATION_FAILED');
        }

        await new Promise((resolve) =>
            setTimeout(resolve, TEST_CASE_GENERATION_POLL_INTERVAL_MS)
        );
    }

    throw new Error('TEST_CASES_GENERATION_IN_PROGRESS');
};

/**
 * Locate the entry-point function for a JavaScript solution. When `callableMode`
 * is false the function is treated as callable only when the source does not
 * already read stdin / write stdout itself (legacy callable tasks).
 */
const getJavaScriptFunctionName = (
    baseBoilerplate: string,
    sourceCode: string,
    callableMode = false
): string | null => {
    const functionPattern =
        /function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/;
    const functionDeclaration =
        functionPattern.exec(baseBoilerplate) ||
        functionPattern.exec(sourceCode);
    const functionName = functionDeclaration?.[1] || functionDeclaration?.[2];

    if (!functionName) {
        return null;
    }

    const implementationPattern = new RegExp(
        `(?:function\\s+${functionName}\\s*\\(|(?:const|let|var)\\s+${functionName}\\s*=)`,
        'm'
    );
    if (!implementationPattern.test(sourceCode)) {
        return null;
    }
    if (callableMode) {
        return functionName;
    }

    const includesProgramInput =
        /\b(?:readFileSync|createInterface)\s*\(|\bprocess\.stdin\b/.test(sourceCode);
    const includesProgramOutput =
        /\b(?:console\.log|process\.stdout\.write)\s*\(/.test(sourceCode);

    return includesProgramInput || includesProgramOutput ? null : functionName;
};

const createJavaScriptFunctionHarness = (
    sourceCode: string,
    functionName: string
): string => [
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

const prepareSourceCodeForExecution = (
    language: string,
    executionMode: ExecutionMode,
    baseBoilerplate: string,
    sourceCode: string
): string => {
    if (language !== 'javascript') {
        return sourceCode;
    }
    if (executionMode !== 'CALLABLE' && executionMode !== 'UNCONFIGURED') {
        return sourceCode;
    }

    const functionName = getJavaScriptFunctionName(
        baseBoilerplate,
        sourceCode,
        executionMode === 'CALLABLE'
    );

    if (!functionName) {
        if (executionMode === 'CALLABLE') {
            throw new Error('CALLABLE_ENTRY_POINT_NOT_FOUND');
        }
        return sourceCode;
    }

    return createJavaScriptFunctionHarness(sourceCode, functionName);
};

interface IJavaParameter {
    type: string;
    name: string;
}

interface IJavaMethod {
    className: string;
    name: string;
    returnType: string;
    parameters: IJavaParameter[];
}

const getJavaMethod = (
    starterCode: string,
    sourceCode: string
): IJavaMethod | null => {
    const methodPattern =
        /\bpublic\s+(?:(?:static|final|synchronized)\s+)*([\w.$<>?,\s]+(?:\[\])*)\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g;
    const candidates = [starterCode, sourceCode];

    for (const candidate of candidates) {
        const className =
            candidate.match(/\bpublic\s+class\s+([A-Za-z_$][\w$]*)/)?.[1] ||
            sourceCode.match(/\bclass\s+([A-Za-z_$][\w$]*)/)?.[1];
        let match: RegExpExecArray | null;

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

const parseJavaCaseInput = (input: string): unknown => {
    const trimmed = input.trim();
    if (!trimmed) {
        return [];
    }

    try {
        return JSON.parse(trimmed) as unknown;
    } catch {
        const arrayLiteral = trimmed.match(/\[[\s\S]*\]/)?.[0];
        if (arrayLiteral) {
            try {
                return JSON.parse(arrayLiteral) as unknown;
            } catch {
                // Fall through to whitespace-delimited input parsing.
            }
        }
    }

    return trimmed.split(/\s+/).map((value) =>
        /^[-+]?\d+$/.test(value)
            ? Number(value)
            : /^[-+]?(?:\d+\.\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value)
                ? Number(value)
                : value
    );
};

const javaStringLiteral = (value: string): string =>
    JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

const javaValueExpression = (type: string, value: unknown): string => {
    const normalizedType = type.replace(/\s+/g, '');
    const arrayType = normalizedType.endsWith('[]');

    if (arrayType) {
        const componentType = normalizedType.slice(0, -2);
        const items = Array.isArray(value) ? value : [value];
        return `new ${componentType}[]{${items.map((item) =>
            javaValueExpression(componentType, item)
        ).join(', ')}}`;
    }
    if (normalizedType.startsWith('List<') || normalizedType.startsWith('Collection<')) {
        const itemType = normalizedType.slice(normalizedType.indexOf('<') + 1, -1);
        const items = Array.isArray(value) ? value : [value];
        return `java.util.Arrays.asList(${items.map((item) =>
            javaValueExpression(itemType, item)
        ).join(', ')})`;
    }
    if (normalizedType.startsWith('Set<')) {
        const itemType = normalizedType.slice(normalizedType.indexOf('<') + 1, -1);
        const items = Array.isArray(value) ? value : [value];
        return `new java.util.LinkedHashSet<>(java.util.Arrays.asList(${items.map((item) =>
            javaValueExpression(itemType, item)
        ).join(', ')}))`;
    }
    if (
        normalizedType === 'String' ||
        normalizedType === 'char' ||
        normalizedType === 'Character'
    ) {
        const text = String(value ?? '');
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
    if (
        normalizedType === 'int' ||
        normalizedType === 'Integer' ||
        normalizedType === 'short' ||
        normalizedType === 'Short' ||
        normalizedType === 'byte' ||
        normalizedType === 'Byte'
    ) {
        return String(value);
    }

    throw new Error(`UNSUPPORTED_JAVA_TEST_PARAMETER_TYPE:${type}`);
};

const getJavaMethodArguments = (
    method: IJavaMethod,
    input: string
): string[] => {
    const parsedInput = parseJavaCaseInput(input);
    let values: unknown[];

    if (
        method.parameters.length === 1 &&
        (Array.isArray(parsedInput) || parsedInput === null || typeof parsedInput !== 'object')
    ) {
        values = [parsedInput];
    } else if (Array.isArray(parsedInput)) {
        values = parsedInput;
    } else if (parsedInput && typeof parsedInput === 'object') {
        const inputObject = parsedInput as Record<string, unknown>;
        values = method.parameters.map((parameter) => inputObject[parameter.name]);
    } else {
        values = [parsedInput];
    }

    if (values.length !== method.parameters.length) {
        throw new Error('INVALID_JAVA_METHOD_TEST_INPUT');
    }

    return method.parameters.map((parameter, index) =>
        javaValueExpression(parameter.type, values[index])
    );
};

const createJavaMethodRunner = (
    method: IJavaMethod,
    input: string
): string => {
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

interface ITestResultDetails {
    expectedOutput: string;
    actualOutput: string;
    error: string | null;
    skipped?: boolean;
}

/**
 * Hidden cases are still executed and compared on the backend, but never echo
 * their name, input, expected output, actual output or raw diagnostics back to
 * the client. Visible cases keep the full API contract.
 */
const toTestResult = (
    testCase: ICodingTaskTestCase,
    status: IRunCourseTaskCodeTestResult['status'],
    passed: boolean,
    details: ITestResultDetails
): IRunCourseTaskCodeTestResult => {
    if (testCase.isHidden === true) {
        return {
            testCaseId: testCase.id,
            name: 'Hidden test case',
            status,
            passed,
            isHidden: true,
            ...(details.skipped ? { skipped: true } : {})
        };
    }

    return {
        testCaseId: testCase.id,
        name: testCase.name,
        status,
        passed,
        expectedOutput: details.expectedOutput,
        actualOutput: details.actualOutput,
        error: details.error,
        ...(details.skipped ? { skipped: true } : {})
    };
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
const runCourseTaskCode = async (
    taskId: string,
    language: string,
    sourceCode: string,
    userId: string
): Promise<IRunCourseTaskCodeResponse> => {
    if (!Types.ObjectId.isValid(taskId)) {
        throw new Error('INVALID_TASK_ID');
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
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
    const canonicalLanguage = normalizeLanguage(language);
    const languageEntry = canonicalLanguage
        ? LANGUAGE_REGISTRY[canonicalLanguage]
        : undefined;

    if (!canonicalLanguage || !languageEntry?.isExecutable) {
        throw new Error('INVALID_LANGUAGE');
    }

    const languageRecord = await ProgrammingLanguages.findOne({
        canonicalKey: canonicalLanguage,
        isActive: true
    })
        .select('_id')
        .lean();

    if (!languageRecord) {
        throw new Error('INVALID_LANGUAGE');
    }

    const task = await CourseTaskModel.findById(taskId)
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

    const executionMode = (task.executionMode || 'UNCONFIGURED') as ExecutionMode;

    if (
        executionMode === 'CALLABLE' &&
        canonicalLanguage !== 'javascript' &&
        canonicalLanguage !== 'java'
    ) {
        throw new Error('CALLABLE_EXECUTION_UNSUPPORTED');
    }

    /**
     * Authorization: the task must belong to a course assigned to the user.
     */
    const parentModule = await CourseModuleModel.findById(task.moduleId)
        .select('courseId')
        .lean();

    if (!parentModule?.courseId) {
        throw new Error('TASK_NOT_ASSIGNED');
    }

    const assignment = await CourseAssignment.findOne({
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
    let testCaseSet = await CodingTaskTestCaseModel.findOne({ taskId })
        .select('taskId status testCases')
        .lean();

    if (testCaseSet?.status === 'GENERATING') {
        testCaseSet = await waitForGeneratedTestCases(taskId);
    } else if (
        testCaseSet?.status !== 'COMPLETED' ||
        !Array.isArray(testCaseSet.testCases) ||
        testCaseSet.testCases.length === 0
    ) {
        try {
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                error.message === 'TEST_CASES_GENERATION_IN_PROGRESS'
            ) {
                testCaseSet = await waitForGeneratedTestCases(taskId);
            } else {
                throw error;
            }
        }

        if (testCaseSet?.status !== 'COMPLETED') {
            testCaseSet = await loadCompletedTestCases(taskId);
        }
    }

    if (
        !testCaseSet ||
        testCaseSet.status !== 'COMPLETED' ||
        !Array.isArray(testCaseSet.testCases) ||
        testCaseSet.testCases.length === 0
    ) {
        throw new Error('TEST_CASES_NOT_GENERATED');
    }

    const javaMethod =
        executionMode === 'CALLABLE' && canonicalLanguage === 'java'
            ? resolveJavaMethod(task, String(languageRecord._id), sourceCode)
            : null;

    const executableSourceCode = prepareSourceCodeForExecution(
        canonicalLanguage,
        executionMode,
        String(task.baseBoilerplate || ''),
        sourceCode
    );

    const testResults: IRunCourseTaskCodeTestResult[] = [];
    let compilationSuccessful = false;
    let compilationFailed = false;
    let infrastructureError: string | null = null;
    let retryAfterSeconds: number | null = null;

    /**
     * Execute every saved case sequentially through the existing Wandbox
     * integration.
     */
    for (const testCase of testCaseSet.testCases as ICodingTaskTestCase[]) {
        if (compilationFailed || infrastructureError) {
            testResults.push(
                toTestResult(
                    testCase,
                    compilationFailed ? 'COMPILE_ERROR' : 'REQUEST_ERROR',
                    false,
                    {
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: '',
                        error: infrastructureError ||
                            'Not run because the submitted code failed to compile.',
                        skipped: true
                    }
                )
            );
            continue;
        }

        let javaRunnerSource: string | undefined;
        if (javaMethod) {
            javaRunnerSource = createJavaMethodRunner(javaMethod, testCase.input);
        }

        const execution = await wandboxExecutionService.executeCode(
            canonicalLanguage,
            executableSourceCode,
            testCase.input,
            {
                taskId,
                languageId: language,
                languageName: LANGUAGE_REGISTRY[canonicalLanguage].displayName,
                testCaseId: testCase.id,
                testCaseInput: testCase.input,
                ...(javaRunnerSource
                    ? {
                        javaRunnerSource,
                        javaEntryPoint: 'Main'
                    }
                    : {})
            }
        );

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
        } else if (!execution.serviceError) {
            compilationSuccessful = true;
        }

        const passed =
            !execution.serviceError &&
            !compileError &&
            execution.success &&
            normalizeOutput(execution.actualOutput) ===
                normalizeOutput(testCase.expectedOutput);

        testResults.push(
            toTestResult(
                testCase,
                getExecutionStatus(
                    passed,
                    compileError,
                    execution.runtimeError,
                    execution.serviceError,
                    execution.error
                ),
                passed,
                {
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: execution.actualOutput,
                    error: passed
                        ? null
                        : execution.serviceError ||
                            compileError ||
                            execution.runtimeError ||
                            execution.error,
                    skipped: Boolean(execution.serviceError)
                }
            )
        );
    }

    const passedTests = testResults.filter((result) => result.passed).length;
    const failedTests = testResults.length - passedTests;
    const allTestsPassed =
        compilationSuccessful &&
        !infrastructureError &&
        testResults.every((result) => result.passed);

    /**
     * Fresh advisory review on every Run/Re-run, bound to this exact source and
     * these execution results. Hidden cases are sanitized before leaving the
     * backend. Review is best-effort: a provider failure only yields an
     * `evaluationError` and never alters the authoritative execution results.
     */
    let evaluation: ICodingTaskCodeReview | null = null;
    let evaluationError: string | null = null;

    try {
        const taskStatement = [
            task.taskName ? `TASK NAME: ${task.taskName}` : '',
            `TASK DESCRIPTION: ${taskDescription}`
        ]
            .filter(Boolean)
            .join('\n');

        const review = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            taskStatement,
            canonicalLanguage,
            sourceCode,
            sanitizeTestResultsForReview(testResults),
            userId
        );

        evaluation = review.feedback ?? null;
        evaluationError = review.feedback
            ? null
            : review.error ||
              'Code review feedback is temporarily unavailable.';
    } catch (error: unknown) {
        console.error(
            'Course task code review failed:',
            error instanceof Error ? error.message : 'UnknownError'
        );
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

const resolveJavaMethod = (
    task: {
        baseBoilerplate?: string | null;
        starterCode?: { languageId: unknown; code: string }[];
    },
    languageId: string,
    sourceCode: string
): IJavaMethod => {
    const languageStarter = (task.starterCode || []).find(
        (starter) => String(starter.languageId) === String(languageId)
    )?.code;

    const javaMethod = getJavaMethod(
        String(languageStarter || task.baseBoilerplate || ''),
        sourceCode
    );

    if (!javaMethod) {
        throw new Error('CALLABLE_ENTRY_POINT_NOT_FOUND');
    }

    return javaMethod;
};

export default {
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
