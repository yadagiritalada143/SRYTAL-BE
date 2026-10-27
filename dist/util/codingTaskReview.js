"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeTestResultsForReview = void 0;
const sanitizeTestResultsForReview = (results) => results.map((result) => {
    var _a;
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
        error: (_a = result.error) !== null && _a !== void 0 ? _a : null
    };
});
exports.sanitizeTestResultsForReview = sanitizeTestResultsForReview;
