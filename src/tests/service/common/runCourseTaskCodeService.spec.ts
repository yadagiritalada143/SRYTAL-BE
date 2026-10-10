import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../../model/codingTaskTestCaseModel';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';
import generateCourseTaskTestCasesService from '../../../services/common/generateCourseTaskTestCasesService';
import wandboxExecutionService from '../../../services/common/wandboxExecutionService';
import reviewCourseTaskCodeService from '../../../services/common/reviewCourseTaskCodeService';
import runCourseTaskCodeService from '../../../services/common/runCourseTaskCodeService';

/**
 * Step 4 scope: multi-case execution only. Code review (Step 5) and submission
 * are intentionally not exercised here.
 */
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
const testCases = [
    {
        id: 'TC001',
        name: 'Basic case',
        input: '2',
        expectedOutput: '4\n',
        category: 'basic'
    },
    {
        id: 'TC002',
        name: 'Negative value',
        input: '-3',
        expectedOutput: '9',
        category: 'negative'
    }
];

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneMock =
    (CodingTaskTestCaseModel as unknown as { findOne: jest.Mock }).findOne;
const programmingLanguageFindOneMock =
    (ProgrammingLanguages as unknown as { findOne: jest.Mock }).findOne;
const generateMock =
    generateCourseTaskTestCasesService.generateCourseTaskTestCases as jest.Mock;
const executeMock = wandboxExecutionService.executeCode as jest.Mock;
const reviewMock =
    reviewCourseTaskCodeService.reviewCourseTaskCode as jest.Mock;

const reviewFeedback = {
    score: 88,
    suggestions: ['Consider the negative-value edge case.'],
    codingStandards: {
        readability: 'clear',
        efficiency: 'O(n) time, O(1) space',
        errorHandling: 'adequate',
        namingConventions: 'good'
    },
    explanation: 'Mostly correct; review the failing visible case.'
};

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
        taskDescription: 'Read an integer and output its square.',
        baseBoilerplate: 'function solve(value) { /* TODO */ }',
    }));
    moduleFindByIdMock.mockReturnValue(queryResult({
        courseId: '66d323456789abcdef123458'
    }));
    assignmentFindOneMock.mockReturnValue(queryResult({ _id: 'assignment-1' }));
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
    ...overrides
});

describe('runCourseTaskCodeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setAccessMocks();
        programmingLanguageFindOneMock.mockReturnValue(queryResult({
            _id: '66d323456789abcdef123459'
        }));
        testCaseFindOneMock.mockReturnValue(queryResult({
            taskId,
            status: 'COMPLETED',
            testCases
        }));
        reviewMock.mockResolvedValue({ feedback: reviewFeedback, error: null });
    });

    it('runs every stored case and compares output on the backend', async () => {
        executeMock
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('9\n'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'cpp',
            'int main() {}',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(2);
        expect(executeMock).toHaveBeenNthCalledWith(
            1,
            'c++',
            'int main() {}',
            '2',
            {
                taskId,
                languageId: 'cpp',
                languageName: 'C++',
                testCaseId: 'TC001',
                testCaseInput: '2'
            }
        );
        expect(result).toEqual({
            codingTaskId: taskId,
            language: 'c++',
            execution: {
                compilationSuccessful: true,
                infrastructureError: null,
                retryAfterSeconds: null,
                totalTests: 2,
                passedTests: 2,
                failedTests: 0,
                allTestsPassed: true,
                testResults: [
                    {
                        testCaseId: 'TC001',
                        name: 'Basic case',
                        status: 'PASSED',
                        passed: true,
                        expectedOutput: '4\n',
                        actualOutput: '4',
                        error: null
                    },
                    {
                        testCaseId: 'TC002',
                        name: 'Negative value',
                        status: 'PASSED',
                        passed: true,
                        expectedOutput: '9',
                        actualOutput: '9\n',
                        error: null
                    }
                ]
            },
            evaluation: reviewFeedback,
            evaluationError: null,
            canSubmit: true
        });
        expect(reviewMock).toHaveBeenCalledTimes(1);
    });

    it('runs legacy callable tasks without an execution mode', async () => {
        taskFindByIdMock.mockReturnValue(queryResult({
            _id: taskId,
            moduleId: '66d323456789abcdef123457',
            type: 'CODE',
            taskDescription: 'Implement a callable solution.',
            baseBoilerplate: 'function solve(value) {}'
        }));
        executeMock
            .mockResolvedValueOnce(executionResult('2'))
            .mockResolvedValueOnce(executionResult('-3'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'javascript',
            'function solve(value) { return value; }',
            userId
        );

        expect(result.execution.passedTests).toBe(0);
        expect(executeMock).toHaveBeenCalledTimes(2);
        expect(executeMock.mock.calls[0][1]).toContain('solve(...__taskArguments)');
    });

    it('invokes a JavaScript function-only solution using each test input', async () => {
        taskFindByIdMock.mockReturnValue(queryResult({
            _id: taskId,
            moduleId: '66d323456789abcdef123457',
            type: 'CODE',
            executionMode: 'CALLABLE',
            taskDescription: 'Return the first character that appears once.',
            baseBoilerplate: 'function firstUniqueCharacter(input) { /* TODO */ }',
        }));
        testCaseFindOneMock.mockReturnValue(queryResult({
            taskId,
            status: 'COMPLETED',
            testCases: [{
                id: 'TC001',
                name: 'First non-repeated character',
                input: 'aabbc',
                expectedOutput: 'c',
                category: 'basic'
            }]
        }));
        executeMock.mockResolvedValueOnce(executionResult('c'));

        const sourceCode =
            'function firstUniqueCharacter(input) { const count = {}; for (const c of input) count[c] = (count[c] || 0) + 1; for (const c of input) if (count[c] === 1) return c; return null; } if (false) console.log("debug");';
        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'javascript',
            sourceCode,
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(1);
        const [language, executableSource, stdin] = executeMock.mock.calls[0];
        expect(language).toBe('javascript');
        expect(executableSource).toContain(sourceCode);
        expect(executableSource).toContain('firstUniqueCharacter(...__taskArguments)');
        expect(executableSource).toContain('if (false) console.log("debug");');
        expect(stdin).toBe('aabbc');
        expect(result.execution.allTestsPassed).toBe(true);
        expect(result.canSubmit).toBe(true);
    });

    it('runs Java method tasks through a generated Main runner and ignores submitted main', async () => {
        const javaBoilerplate =
            'This language-neutral contract intentionally has no Java method syntax.';
        const javaStarterCode =
            'import java.util.*; public class Solution { public int[] findDuplicates(int[] nums) { /* TODO */ return nums; } }';
        const sourceCode = [
            'import java.util.*;',
            'public class Solution {',
            '  public int[] findDuplicates(int[] nums) {',
            '    Map<Integer, Integer> count = new HashMap<>();',
            '    for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);',
            '    Set<Integer> result = new LinkedHashSet<>();',
            '    for (int n : nums) if (count.get(n) > 1) result.add(n);',
            '    return result.stream().mapToInt(Integer::intValue).toArray();',
            '  }',
            '  public static void main(String[] args) {',
            '    System.out.println("[1, 2]");',
            '  }',
            '}'
        ].join('\n');
        const javaTestCases = [
            {
                id: 'TC001',
                name: 'Duplicates',
                input: '[1,1,2,2,3]',
                expectedOutput: '[1, 2]',
                category: 'basic'
            },
            {
                id: 'TC002',
                name: 'No duplicates',
                input: '[1,2,3]',
                expectedOutput: '[]',
                category: 'edge'
            }
        ];
        taskFindByIdMock.mockReturnValue(queryResult({
            _id: taskId,
            moduleId: '66d323456789abcdef123457',
            type: 'CODE',
            executionMode: 'CALLABLE',
            taskDescription: 'Return values appearing more than once.',
            baseBoilerplate: javaBoilerplate,
            starterCode: [{
                languageId: '66d323456789abcdef123459',
                code: javaStarterCode
            }]
        }));
        testCaseFindOneMock.mockReturnValue(queryResult({
            taskId,
            status: 'COMPLETED',
            testCases: javaTestCases
        }));
        executeMock.mockImplementation(async (
            _language: string,
            submittedSource: string,
            _stdin: string,
            context: {
                javaRunnerSource?: string;
                javaEntryPoint?: string;
                testCaseId: string;
                testCaseInput?: string;
            }
        ) => {
            expect(submittedSource).toContain('System.out.println("[1, 2]")');
            expect(context.javaEntryPoint).toBe('Main');
            expect(context.javaRunnerSource).toContain('new Solution().findDuplicates(');
            expect(context.javaRunnerSource).not.toContain('Solution.main');
            expect(context.testCaseInput).toBe(
                javaTestCases.find(({ id }) => id === context.testCaseId)?.input
            );
            const numbers = context.testCaseInput
                ?.match(/-?\d+/g)
                ?.map(Number) || [];
            const counts = new Map<number, number>();
            numbers.forEach((number) => counts.set(number, (counts.get(number) || 0) + 1));
            const duplicates = [...new Set(numbers.filter((number) => counts.get(number)! > 1))];
            return executionResult(`[${duplicates.join(', ')}]`);
        });

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'java',
            sourceCode,
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(2);
        expect(executeMock.mock.calls[0][3].javaRunnerSource).toContain(
            'new int[]{1, 1, 2, 2, 3}'
        );
        expect(executeMock.mock.calls[1][3].javaRunnerSource).toContain(
            'new int[]{1, 2, 3}'
        );
        expect(result.execution.testResults.map(({ status, actualOutput }) => ({
            status,
            actualOutput
        }))).toEqual([
            { status: 'PASSED', actualOutput: '[1, 2]' },
            { status: 'PASSED', actualOutput: '[]' }
        ]);
        expect(result.execution.allTestsPassed).toBe(true);
        expect(result.canSubmit).toBe(true);
    });

    it('generates cases only when no completed set exists, then loads the saved set', async () => {
        testCaseFindOneMock
            .mockReturnValueOnce(queryResult(null))
            .mockReturnValueOnce(queryResult({
                taskId,
                status: 'COMPLETED',
                testCases: [testCases[0]]
            }));
        generateMock.mockResolvedValue({ generated: true });
        executeMock.mockResolvedValue(executionResult('4'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(generateMock).toHaveBeenCalledWith(taskId, userId);
        expect(testCaseFindOneMock).toHaveBeenCalledTimes(2);
        expect(result.execution.totalTests).toBe(1);
    });

    it('waits for the existing generation lock instead of starting another generation', async () => {
        testCaseFindOneMock
            .mockReturnValueOnce(queryResult({
                taskId,
                status: 'GENERATING',
                testCases: []
            }))
            .mockReturnValueOnce(queryResult({
                taskId,
                status: 'COMPLETED',
                testCases: [testCases[0]]
            }));
        executeMock.mockResolvedValue(executionResult('4'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(testCaseFindOneMock).toHaveBeenCalledTimes(2);
        expect(executeMock).toHaveBeenCalledWith(
            'python',
            'print(4)',
            '2',
            {
                taskId,
                languageId: 'python',
                languageName: 'Python',
                testCaseId: 'TC001',
                testCaseInput: '2'
            }
        );
        expect(result.execution.testResults.map(({ testCaseId }) => testCaseId))
            .toEqual(['TC001']);
    });

    it('reuses identical stored IDs while executing the latest source on each run', async () => {
        executeMock
            .mockResolvedValueOnce(executionResult('wrong'))
            .mockResolvedValueOnce(executionResult('wrong'))
            .mockResolvedValueOnce(executionResult('wrong'))
            .mockResolvedValueOnce(executionResult('wrong'));

        const firstRun = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print("version 1")',
            userId
        );
        const secondRun = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print("version 2")',
            userId
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(executeMock.mock.calls.map(([language, code]) => [language, code]))
            .toEqual([
                ['python', 'print("version 1")'],
                ['python', 'print("version 1")'],
                ['python', 'print("version 2")'],
                ['python', 'print("version 2")']
            ]);
        expect(firstRun.execution.testResults.map(({ testCaseId }) => testCaseId))
            .toEqual(secondRun.execution.testResults.map(({ testCaseId }) => testCaseId));
        expect(secondRun.execution.testResults.map(({ testCaseId }) => testCaseId))
            .toEqual(['TC001', 'TC002']);
    });

    it('does not generate again when completed cases already exist', async () => {
        executeMock
            .mockResolvedValueOnce(executionResult('wrong'))
            .mockResolvedValueOnce(executionResult('wrong'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(0)',
            userId
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(executeMock).toHaveBeenCalledTimes(2);
        expect(result.execution.failedTests).toBe(2);
        expect(result.execution.allTestsPassed).toBe(false);
        expect(result.canSubmit).toBe(false);
        expect(result.evaluation).toEqual(reviewFeedback);
        expect(result.evaluationError).toBeNull();
    });

    it('does not submit more code after a compilation failure', async () => {
        executeMock.mockResolvedValue(executionResult('', {
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
        expect(result.execution.totalTests).toBe(2);
        expect(result.execution.compilationSuccessful).toBe(false);
        expect(result.execution.failedTests).toBe(2);
        expect(result.execution.testResults[0].error).toBe('missing semicolon');
        expect(result.execution.testResults[0].status).toBe('COMPILE_ERROR');
        expect(result.execution.testResults[1].error).toContain('failed to compile');
        expect(result.execution.testResults[1].status).toBe('COMPILE_ERROR');
        expect(result.canSubmit).toBe(false);
        expect(reviewMock).toHaveBeenCalledTimes(1);
        expect(result.evaluation).toEqual(reviewFeedback);
    });

    it('continues to subsequent cases after a runtime error', async () => {
        executeMock
            .mockResolvedValueOnce(executionResult('', {
                success: false,
                error: 'Program execution failed.',
                runtimeError: 'runtime crash'
            }))
            .mockResolvedValueOnce(executionResult('9'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(9)',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(2);
        expect(result.execution.testResults[0].error).toBe('runtime crash');
        expect(result.execution.testResults[0].status).toBe('RUNTIME_ERROR');
        expect(result.execution.testResults[1].passed).toBe(true);
        expect(result.execution.compilationSuccessful).toBe(true);
        expect(result.canSubmit).toBe(false);
    });

    it('stops execution after a Wandbox rate limit and identifies unrun cases', async () => {
        executeMock.mockResolvedValue(executionResult('', {
            success: false,
            error: 'The code execution service is rate limited. Please wait briefly and try again.',
            serviceError: 'RATE_LIMITED'
        }));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(result.execution.infrastructureError).toContain('rate limited');
        expect(result.execution.testResults[0].skipped).toBe(true);
        expect(result.execution.testResults[0].status).toBe('REQUEST_ERROR');
        expect(result.execution.testResults[1].skipped).toBe(true);
        expect(result.canSubmit).toBe(false);
        expect(result.evaluation).toEqual(reviewFeedback);
    });

    it('rejects a language outside the execution whitelist', async () => {
        await expect(
            runCourseTaskCodeService.runCourseTaskCode(
                taskId,
                'unknown',
                'source',
                userId
            )
        ).rejects.toThrow('INVALID_LANGUAGE');
        expect(taskFindByIdMock).not.toHaveBeenCalled();
    });

    it('resolves an active database language and runs the saved cases', async () => {
        executeMock.mockResolvedValue(executionResult('4'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(programmingLanguageFindOneMock).toHaveBeenCalledWith({
            canonicalKey: 'python',
            isActive: true
        });
        expect(taskFindByIdMock).toHaveBeenCalled();
        expect(result.execution.totalTests).toBe(2);
    });

    it('rejects a language that is inactive in the database', async () => {
        programmingLanguageFindOneMock.mockReturnValue(queryResult(null));

        await expect(
            runCourseTaskCodeService.runCourseTaskCode(
                taskId,
                'python',
                'print(4)',
                userId
            )
        ).rejects.toThrow('INVALID_LANGUAGE');

        expect(taskFindByIdMock).not.toHaveBeenCalled();
        expect(executeMock).not.toHaveBeenCalled();
    });

    it('rejects a language that has no database record at all', async () => {
        programmingLanguageFindOneMock.mockReturnValue(queryResult(null));

        await expect(
            runCourseTaskCodeService.runCourseTaskCode(
                taskId,
                'cpp',
                'int main() {}',
                userId
            )
        ).rejects.toThrow('INVALID_LANGUAGE');

        expect(executeMock).not.toHaveBeenCalled();
    });

    it('returns AI evaluation feedback when the review succeeds', async () => {
        executeMock.mockResolvedValue(executionResult('4'));

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        expect(reviewMock).toHaveBeenCalledTimes(1);
        expect(reviewMock.mock.calls[0][0]).toContain('TASK DESCRIPTION:');
        expect(reviewMock.mock.calls[0][1]).toBe('python');
        expect(reviewMock.mock.calls[0][2]).toBe('print(4)');
        expect(result.evaluation).toEqual(reviewFeedback);
        expect(result.evaluationError).toBeNull();
    });

    it('reviews every run with the latest source code and latest execution results', async () => {
        executeMock
            .mockResolvedValueOnce(executionResult('wrong'))
            .mockResolvedValueOnce(executionResult('9'))
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('9'));
        reviewMock
            .mockResolvedValueOnce({
                feedback: { ...reviewFeedback, score: 40 },
                error: null
            })
            .mockResolvedValueOnce({
                feedback: { ...reviewFeedback, score: 90 },
                error: null
            });

        const firstRun = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print("version 1")',
            userId
        );
        const secondRun = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print("version 2")',
            userId
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(reviewMock).toHaveBeenCalledTimes(2);

        const [, firstLanguage, firstSource, firstResults] =
            reviewMock.mock.calls[0];
        expect(firstLanguage).toBe('python');
        expect(firstSource).toBe('print("version 1")');
        expect(
            (firstResults as { passed: boolean }[]).map(({ passed }) => passed)
        ).toEqual([false, true]);

        const [, secondLanguage, secondSource, secondResults] =
            reviewMock.mock.calls[1];
        expect(secondLanguage).toBe('python');
        expect(secondSource).toBe('print("version 2")');
        expect(
            (secondResults as { passed: boolean }[]).map(({ passed }) => passed)
        ).toEqual([true, true]);

        expect(firstRun.evaluation?.score).toBe(40);
        expect(secondRun.evaluation?.score).toBe(90);
        expect(firstRun.execution.passedTests).toBe(1);
        expect(secondRun.execution.passedTests).toBe(2);
    });

    it('preserves execution results when the AI review is unavailable', async () => {
        executeMock
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('9'));
        reviewMock.mockResolvedValueOnce({
            feedback: null,
            error: 'Code review feedback is temporarily unavailable.'
        });

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
        expect(result.evaluation).toBeNull();
        expect(result.evaluationError).toBe(
            'Code review feedback is temporarily unavailable.'
        );
        expect(result.canSubmit).toBe(true);
    });

    it('never sends hidden inputs or expected outputs to the AI provider', async () => {
        testCaseFindOneMock.mockReturnValue(queryResult({
            taskId,
            status: 'COMPLETED',
            testCases: [
                {
                    id: 'TC001',
                    name: 'Visible',
                    input: '2',
                    expectedOutput: '4',
                    category: 'basic'
                },
                {
                    id: 'H1',
                    name: 'Secret overflow case',
                    input: '2147483647',
                    expectedOutput: '2147483648',
                    category: 'boundary',
                    isHidden: true
                }
            ]
        }));
        executeMock
            .mockResolvedValueOnce(executionResult('4'))
            .mockResolvedValueOnce(executionResult('0'));

        await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(4)',
            userId
        );

        const reviewPayload = JSON.stringify(reviewMock.mock.calls[0][3]);
        expect(reviewPayload).not.toContain('2147483647');
        expect(reviewPayload).not.toContain('2147483648');
        expect(reviewPayload).not.toContain('Secret overflow case');
        expect(reviewMock.mock.calls[0][3]).toEqual([
            {
                testCaseId: 'TC001',
                name: 'Visible',
                status: 'PASSED',
                passed: true,
                expectedOutput: '4',
                actualOutput: '4',
                error: null
            },
            {
                testCaseId: 'H1',
                name: 'Hidden test case',
                status: 'WRONG_OUTPUT',
                passed: false,
                isHidden: true
            }
        ]);
    });

    it('never lets AI feedback override actual test results', async () => {
        executeMock.mockResolvedValue(executionResult('wrong'));
        reviewMock.mockResolvedValueOnce({
            feedback: { ...reviewFeedback, score: 100 },
            error: null
        });

        const result = await runCourseTaskCodeService.runCourseTaskCode(
            taskId,
            'python',
            'print(0)',
            userId
        );

        expect(result.evaluation?.score).toBe(100);
        expect(result.execution).toMatchObject({
            passedTests: 0,
            failedTests: 2,
            allTestsPassed: false
        });
        expect(result.canSubmit).toBe(false);
    });

    it('preserves meaningful output whitespace while tolerating one trailing newline', () => {
        expect(runCourseTaskCodeService.normalizeOutput('  value  \r\n')).toBe('  value  ');
        expect(runCourseTaskCodeService.normalizeOutput('value\n\n')).not.toBe('value');
    });

    it('classifies output mismatch and timeout results distinctly', () => {
        expect(runCourseTaskCodeService.getExecutionStatus(
            false,
            null,
            null,
            null,
            null
        )).toBe('WRONG_OUTPUT');
        expect(runCourseTaskCodeService.getExecutionStatus(
            false,
            null,
            'Execution timed out.',
            null,
            'Execution timed out.'
        )).toBe('TIMEOUT');
    });
});
