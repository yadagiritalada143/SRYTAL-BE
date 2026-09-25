import { ITestCase } from '../../interfaces/codingQuestionTestCase';
import { ICodeRunTestCaseResult } from '../../interfaces/codingQuestion';
import { IExecuteCodeResponse } from './executeCodeService';

/**
 * Normalizes an output for comparison so that harmless formatting differences
 * (CRLF vs LF, padding spaces around lines, trailing blank lines) never turn a
 * correct answer into a failed one. Comparison is otherwise exact.
 */
export const normalizeOutput = (output: string | undefined | null): string =>
    String(output ?? '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();

/**
 * Reusable per-test-case comparator. Produces the single source of truth for a
 * test case's pass/fail verdict based on the Piston execution result. The AI /
 * code-quality analysis must never influence this verdict.
 *
 * Handles:
 * - Correct output                     -> passed
 * - Incorrect output                   -> failed
 * - Empty output                       -> failed (unless output was expected empty)
 * - Compilation errors                 -> failed + compilation error info
 * - Runtime errors / non-zero exit     -> failed + runtime error info
 * - Timeouts (time-limit exceeded)     -> failed + timeout info
 * - Whitelisting / upstream execution failures -> failed + error info
 */
export const evaluateTestCase = (
    testCase: ITestCase,
    execution: IExecuteCodeResponse
): ICodeRunTestCaseResult => {
    const actualOutput = (execution.stdout ?? '').trimEnd();
    let passed = false;
    let errorDetails: string | undefined;

    if (execution.status === 'COMPLETED') {
        if (normalizeOutput(testCase.expectedOutput) === normalizeOutput(actualOutput)) {
            passed = true;
        } else if (actualOutput.trim() === '') {
            errorDetails = 'Your program produced no output on standard output.';
        } else {
            errorDetails = 'Your program produced an incorrect output for this test case.';
        }
    } else if (execution.status === 'COMPILATION_ERROR') {
        errorDetails =
            execution.compilationError ||
            'Your code failed to compile.';
    } else if (execution.status === 'RUNTIME_ERROR') {
        errorDetails =
            execution.runtimeError ||
            execution.stderr ||
            'Your program crashed during execution.';
    } else if (execution.status === 'TIME_LIMIT_EXCEEDED') {
        errorDetails =
            execution.runtimeError ||
            'Your program exceeded the allowed execution time.';
    } else {
        errorDetails =
            execution.stderr ||
            execution.runtimeError ||
            'Your code could not be executed.';
    }

    return {
        name: testCase.name,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        passed,
        status: execution.status,
        stderr: execution.stderr || undefined,
        compilationError: execution.compilationError || undefined,
        runtimeError: execution.runtimeError || undefined,
        executionTimeMs: execution.executionTimeMs,
        errorDetails
    };
};

/**
 * Convenience summary computed purely from the per-test-case verdicts. Used to
 * derive totals and the authoritative (execution-based) score.
 */
export const summarizeResults = (
    results: ICodeRunTestCaseResult[]
): { total: number; passed: number; failed: number; score: number } => {
    const total = results.length;
    const passed = results.filter((result) => result.passed).length;
    const failed = total - passed;
    const score = total === 0 ? 0 : Math.round((passed / total) * 100);
    return { total, passed, failed, score };
};

export default { evaluateTestCase, summarizeResults, normalizeOutput };