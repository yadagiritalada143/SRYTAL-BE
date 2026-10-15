import { IRunCourseTaskCodeTestResult } from '../interfaces/runCourseTaskCode';

/**
 * Reduce execution results to the only fields that may leave the backend for
 * AI review. Hidden test cases keep just their id/name/status/pass flag so
 * their input, expected output, actual output and diagnostics are never sent to
 * the provider.
 */
export const sanitizeTestResultsForReview = (
    results: IRunCourseTaskCodeTestResult[]
): Record<string, unknown>[] =>
    results.map((result) => {
        if (result.isHidden === true) {
            return {
                testCaseId: result.testCaseId,
                name: result.name,
                status: result.status,
                passed: result.passed,
                isHidden: true
            };
        }

        return {
            testCaseId: result.testCaseId,
            name: result.name,
            status: result.status,
            passed: result.passed,
            expectedOutput: result.expectedOutput,
            actualOutput: result.actualOutput,
            error: result.error ?? null
        };
    });
