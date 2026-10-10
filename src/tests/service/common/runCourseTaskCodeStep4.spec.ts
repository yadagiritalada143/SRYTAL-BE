import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../../model/codingTaskTestCaseModel';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';
import generateCourseTaskTestCasesService from '../../../services/common/generateCourseTaskTestCasesService';
import wandboxExecutionService from '../../../services/common/wandboxExecutionService';
import reviewCourseTaskCodeService from '../../../services/common/reviewCourseTaskCodeService';
import runCourseTaskCodeService from '../../../services/common/runCourseTaskCodeService';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/codingTaskTestCaseModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
jest.mock('../../../services/common/generateCourseTaskTestCasesService', () => ({
    __esModule: true,
    default: { generateCourseTaskTestCases: jest.fn() }
}));
jest.mock('../../../services/common/wandboxExecutionService', () => ({
    __esModule: true,
    default: { executeCode: jest.fn() }
}));
jest.mock('../../../services/common/reviewCourseTaskCodeService', () => ({
    __esModule: true,
    default: { reviewCourseTaskCode: jest.fn() }
}));

const taskId = '66d323456789abcdef123456';
const userId = '65f1a2b3c4d5e6f7890abcd2';

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneMock =
    (CodingTaskTestCaseModel as unknown as { findOne: jest.Mock }).findOne;
const generateMock =
    generateCourseTaskTestCasesService.generateCourseTaskTestCases as jest.Mock;
const executeMock = wandboxExecutionService.executeCode as jest.Mock;
const reviewMock =
    reviewCourseTaskCodeService.reviewCourseTaskCode as jest.Mock;

const queryResult = (result: unknown): { select: jest.Mock } => ({
    select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(result)
    })
});

const setAccessMocks = (): void => {
    taskFindByIdMock.mockReturnValue(queryResult({
        _id: taskId,
        moduleId: '66d323456789abcdef123457',
        type: 'CODE',
        executionMode: 'STDIN',
        taskDescription: 'Read an integer and output its square.'
    }));
    moduleFindByIdMock.mockReturnValue(queryResult({
        courseId: '66d323456789abcdef123458'
    }));
    assignmentFindOneMock.mockReturnValue(queryResult({ _id: 'assignment-1' }));
};

const setStoredCases = (testCases: unknown[]): void => {
    testCaseFindOneMock.mockReturnValue(queryResult({
        taskId,
        status: 'COMPLETED',
        testCases
    }));
};

const executionResult = (
    actualOutput: string,
    overrides: Record<string, unknown> = {}
): object => ({
    success: true,
    actualOutput,
    stderr: '',
    error: null,
    compileError: null,
    runtimeError: null,
    executionTime: 10,
    serviceError: null,
    retryAfterSeconds: null,
    ...overrides
});

describe('runCourseTaskCodeService (Step 4 multi-case execution)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setAccessMocks();
        (ProgrammingLanguages as unknown as { findOne: jest.Mock }).findOne
            .mockReturnValue(queryResult({ _id: '66d323456789abcdef123459' }));
        executeMock.mockReset();
        generateMock.mockReset();
        reviewMock.mockReset();
        reviewMock.mockResolvedValue({
            feedback: {
                score: 80,
                suggestions: [],
                codingStandards: {
                    readability: 'ok',
                    efficiency: 'ok',
                    errorHandling: 'ok',
                    namingConventions: 'ok'
                },
                explanation: 'ok'
            },
            error: null
        });
    });

    it('executes every saved case sequentially with mixed pass/fail aggregates', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Basic', input: '2', expectedOutput: '4', category: 'basic' },
            { id: 'TC002', name: 'Wrong', input: '3', expectedOutput: '9', category: 'edge' },
            { id: 'TC003', name: 'Later', input: '4', expectedOutput: '16', category: 'edge' }
        ]);
        executeMock
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('10'))
            .mockResolvedValueOnce(executionResult('16'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(3);
        expect(executeMock.mock.calls.map((call) => call[2])).toEqual(['2', '3', '4']);
        expect(result.execution).toMatchObject({
            compilationSuccessful: true,
            infrastructureError: null,
            totalTests: 3,
            passedTests: 2,
            failedTests: 1,
            allTestsPassed: false
        });
        expect(result.execution.testResults.map(({ status }) => status))
            .toEqual(['PASSED', 'WRONG_OUTPUT', 'PASSED']);
        expect(result.canSubmit).toBe(false);
        expect(generateMock).not.toHaveBeenCalled();
    });

    it('returns an all-pass summary when every saved case passes', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Basic', input: '2', expectedOutput: '4', category: 'basic' },
            { id: 'TC002', name: 'Trailing newline', input: '3', expectedOutput: '9', category: 'edge' }
        ]);
        executeMock
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('9\n'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(result.execution).toMatchObject({
            totalTests: 2,
            passedTests: 2,
            failedTests: 0,
            allTestsPassed: true
        });
        expect(result.canSubmit).toBe(true);
    });

    it('never exposes hidden inputs, expected outputs, or actual outputs', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Visible', input: '2', expectedOutput: '4', category: 'basic' },
            {
                id: 'TC002',
                name: 'Secret overflow case',
                input: '2147483647',
                expectedOutput: '2147483648',
                category: 'boundary',
                isHidden: true
            }
        ]);
        executeMock
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('0'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        const [visible, hidden] = result.execution.testResults;

        expect(visible).toMatchObject({
            testCaseId: 'TC001',
            name: 'Visible',
            status: 'PASSED',
            passed: true,
            expectedOutput: '4',
            actualOutput: '4'
        });
        expect(visible.isHidden).toBeUndefined();

        expect(hidden).toEqual({
            testCaseId: 'TC002',
            name: 'Hidden test case',
            status: 'WRONG_OUTPUT',
            passed: false,
            isHidden: true
        });
        expect(hidden).not.toHaveProperty('expectedOutput');
        expect(hidden).not.toHaveProperty('actualOutput');
        expect(hidden).not.toHaveProperty('error');
        expect(hidden).not.toHaveProperty('input');

        const serialized = JSON.stringify(result);
        expect(serialized).not.toContain('2147483647');
        expect(serialized).not.toContain('2147483648');
        expect(serialized).not.toContain('Secret overflow case');
        expect(serialized).not.toContain('"input"');

        expect(reviewMock).toHaveBeenCalledTimes(1);
        const reviewPayload = JSON.stringify(reviewMock.mock.calls[0][3]);
        expect(reviewPayload).not.toContain('2147483647');
        expect(reviewPayload).not.toContain('2147483648');
        expect(reviewPayload).not.toContain('Secret overflow case');
    });

    it('handles empty output with trailing-newline tolerance', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Empty match', input: '', expectedOutput: '', category: 'empty' },
            { id: 'TC002', name: 'Empty actual newline', input: '', expectedOutput: '', category: 'empty' },
            { id: 'TC003', name: 'Empty expected mismatch', input: '', expectedOutput: '', category: 'empty' }
        ]);
        executeMock
            .mockResolvedValueOnce(executionResult(''))
            .mockResolvedValueOnce(executionResult('\n'))
            .mockResolvedValueOnce(executionResult('unexpected'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print("")',
            userId
        );

        expect(result.execution.testResults.map(({ status }) => status))
            .toEqual(['PASSED', 'PASSED', 'WRONG_OUTPUT']);
        expect(result.execution).toMatchObject({ totalTests: 3, passedTests: 2, failedTests: 1 });
        expect(result.canSubmit).toBe(false);
    });

    it('marks a compile error on the first case and skips later cases as failed', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Basic', input: '2', expectedOutput: '4', category: 'basic' },
            { id: 'TC002', name: 'Later', input: '3', expectedOutput: '9', category: 'edge' }
        ]);
        executeMock.mockResolvedValueOnce(executionResult('', {
            success: false,
            error: 'Compilation failed.',
            compileError: 'missing semicolon'
        }));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'invalid code',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(result.execution).toMatchObject({
            compilationSuccessful: false,
            infrastructureError: null,
            totalTests: 2,
            passedTests: 0,
            failedTests: 2,
            allTestsPassed: false
        });
        expect(result.execution.testResults[0]).toMatchObject({
            status: 'COMPILE_ERROR',
            passed: false,
            error: 'missing semicolon'
        });
        expect(result.execution.testResults[1]).toMatchObject({
            status: 'COMPILE_ERROR',
            passed: false,
            skipped: true
        });
        expect(result.execution.testResults.every(({ passed }) => !passed)).toBe(true);
        expect(result.canSubmit).toBe(false);
    });

    it('classifies runtime errors and timeouts as failures without stopping later cases', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Crash', input: '1', expectedOutput: '1', category: 'basic' },
            { id: 'TC002', name: 'Slow', input: '2', expectedOutput: '4', category: 'edge' },
            { id: 'TC003', name: 'Good', input: '3', expectedOutput: '9', category: 'edge' }
        ]);
        executeMock
            .mockResolvedValueOnce(executionResult('', {
                success: false,
                error: 'Program execution failed.',
                runtimeError: 'runtime crash'
            }))
            .mockResolvedValueOnce(executionResult('', {
                success: false,
                error: 'Execution timed out.',
                runtimeError: 'Execution timed out.'
            }))
            .mockResolvedValueOnce(executionResult('9'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(9)',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(3);
        expect(result.execution.testResults.map(({ status, passed }) => ({ status, passed })))
            .toEqual([
                { status: 'RUNTIME_ERROR', passed: false },
                { status: 'TIMEOUT', passed: false },
                { status: 'PASSED', passed: true }
            ]);
        expect(result.execution).toMatchObject({
            compilationSuccessful: true,
            totalTests: 3,
            passedTests: 1,
            failedTests: 2,
            allTestsPassed: false
        });
        expect(result.execution.testResults[1].error).toBe('Execution timed out.');
        expect(result.canSubmit).toBe(false);
    });

    it('marks infrastructure failures as failed for every case without exposing outputs as passed', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Basic', input: '2', expectedOutput: '4', category: 'basic' },
            { id: 'TC002', name: 'Edge', input: '0', expectedOutput: '0', category: 'edge' }
        ]);
        executeMock.mockResolvedValueOnce(executionResult('', {
            success: false,
            error: 'The code execution service is unavailable.',
            serviceError: 'UNAVAILABLE'
        }));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(result.execution.infrastructureError).toContain('unavailable');
        expect(result.execution.testResults.map(({ status, passed }) => ({ status, passed })))
            .toEqual([
                { status: 'REQUEST_ERROR', passed: false },
                { status: 'REQUEST_ERROR', passed: false }
            ]);
        expect(result.execution.testResults.every(({ skipped }) => skipped === true)).toBe(true);
        expect(result.execution).toMatchObject({ totalTests: 2, passedTests: 0, failedTests: 2 });
        expect(result.canSubmit).toBe(false);
    });

    it('reuses saved cases across runs without regenerating', async () => {
        setStoredCases([
            { id: 'TC001', name: 'Basic', input: '2', expectedOutput: '4', category: 'basic' },
            { id: 'TC002', name: 'Edge', input: '0', expectedOutput: '0', category: 'edge' }
        ]);
        executeMock.mockResolvedValue(executionResult('4'));

        const first = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );
        const second = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(5)',
            userId
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(executeMock).toHaveBeenCalledTimes(4);
        expect(first.execution.testResults.map(({ testCaseId }) => testCaseId))
            .toEqual(['TC001', 'TC002']);
        expect(second.execution.testResults.map(({ testCaseId }) => testCaseId))
            .toEqual(['TC001', 'TC002']);
    });
});
