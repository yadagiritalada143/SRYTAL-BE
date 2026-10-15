import { IRunCourseTaskCodeTestResult } from '../interfaces/runCourseTaskCode';

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
