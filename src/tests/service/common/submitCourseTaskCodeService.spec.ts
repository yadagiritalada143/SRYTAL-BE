import CourseTaskCodeSubmissionModel from '../../../model/courseTaskCodeSubmissionModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import runCourseTaskCodeService from '../../../services/common/runCourseTaskCodeService';
import reviewCourseTaskCodeService from '../../../services/common/reviewCourseTaskCodeService';
import submitCourseTaskCodeService from '../../../services/common/submitCourseTaskCodeService';

jest.mock('../../../model/courseTaskCodeSubmissionModel', () => ({
    __esModule: true,
    default: { create: jest.fn() }
}));
jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../services/common/runCourseTaskCodeService', () => ({
    __esModule: true,
    default: { runCourseTaskCode: jest.fn() }
}));
jest.mock('../../../services/common/reviewCourseTaskCodeService', () => ({
    __esModule: true,
    default: { reviewCourseTaskCode: jest.fn(), parseReview: jest.fn() }
}));

const userId = '65f1a2b3c4d5e6f7890abcd2';
const taskId = '66d323456789abcdef123456';
const results = [{
    testCaseId: 'TC001',
    name: 'Basic case',
    status: 'PASSED' as const,
    passed: true,
    expectedOutput: '4',
    actualOutput: '4',
    error: null
}];
const runMock = runCourseTaskCodeService.runCourseTaskCode as jest.Mock;
const reviewMock =
    reviewCourseTaskCodeService.reviewCourseTaskCode as jest.Mock;
const findByIdMock =
    (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const createMock =
    (CourseTaskCodeSubmissionModel as unknown as { create: jest.Mock }).create;

describe('submitCourseTaskCodeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        runMock.mockResolvedValue({
            codingTaskId: taskId,
            language: 'python',
            execution: {
                compilationSuccessful: true,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: {
                score: 95,
                suggestions: [],
                codingStandards: {
                    readability: 'good',
                    efficiency: 'good',
                    errorHandling: 'good',
                    namingConventions: 'good'
                },
                explanation: 'All mandatory tests passed.'
            },
            evaluationError: null,
            canSubmit: true
        });
        createMock.mockResolvedValue({
            _id: 'submission-1',
            score: 95,
            submittedAt: new Date('2026-10-08T00:00:00.000Z')
        });
    });

    it('revalidates the exact submitted source and stores only if compile and every test pass', async () => {
        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(runMock).toHaveBeenCalledWith(taskId, 'Python', 'print(4)', userId);
        expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
            userId: expect.anything(),
            codingTaskId: expect.anything(),
            language: 'python',
            sourceCode: 'print(4)',
            testResults: results,
            score: 95,
            status: 'SUBMITTED'
        }));
        expect(JSON.stringify(createMock.mock.calls[0][0])).not.toContain('openrouterKey');
        expect(result).toEqual({
            submitted: true,
            canSubmit: true,
            message: 'Coding task submitted successfully.',
            submission: {
                id: 'submission-1',
                score: 95,
                submittedAt: new Date('2026-10-08T00:00:00.000Z'),
                status: 'SUBMITTED'
            }
        });
    });

    it('reuses the fresh evaluation returned by the Run service without a second review call', async () => {
        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(runMock).toHaveBeenCalledWith(taskId, 'Python', 'print(4)', userId);
        expect(reviewMock).not.toHaveBeenCalled();
        expect(createMock.mock.calls[0][0].score).toBe(95);
        expect(result.submission?.score).toBe(95);
    });

    it('rejects a failed mandatory test regardless of the Run Code canSubmit field', async () => {
        runMock.mockResolvedValueOnce({
            language: 'python',
            execution: {
                compilationSuccessful: true,
                totalTests: 1,
                passedTests: 0,
                failedTests: 1,
                allTestsPassed: false,
                testResults: [{ ...results[0], passed: false }]
            },
            evaluation: { score: 100 },
            canSubmit: true
        });

        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(3)',
            userId
        );

        expect(result).toEqual({
            submitted: false,
            canSubmit: false,
            message: 'Please fix the failed test cases before submitting.'
        });
        expect(createMock).not.toHaveBeenCalled();
    });

    it('rejects compilation failure even if every returned test result is marked passed', async () => {
        runMock.mockResolvedValueOnce({
            language: 'python',
            execution: {
                compilationSuccessful: false,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: null,
            canSubmit: true
        });

        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(result.canSubmit).toBe(false);
        expect(createMock).not.toHaveBeenCalled();
    });

    it('validates task ID and non-empty source before execution', async () => {
        await expect(
            submitCourseTaskCodeService.submitCourseTaskCode(
                'bad-id',
                'Python',
                'print(4)',
                userId
            )
        ).rejects.toThrow('INVALID_TASK_ID');
        await expect(
            submitCourseTaskCodeService.submitCourseTaskCode(
                taskId,
                'Python',
                '  ',
                userId
            )
        ).rejects.toThrow('INVALID_SOURCE_CODE');
        expect(runMock).not.toHaveBeenCalled();
    });

    it('stores a null score when optional OpenRouter evaluation is unavailable', async () => {
        runMock.mockResolvedValueOnce({
            language: 'python',
            execution: {
                compilationSuccessful: true,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: null,
            evaluationError: 'Code review feedback is temporarily unavailable.',
            canSubmit: true
        });
        createMock.mockResolvedValue({
            _id: 'submission-2',
            score: null,
            submittedAt: new Date()
        });

        await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );
        expect(createMock.mock.calls[0][0].score).toBeNull();
    });

    it('persists hidden test cases without expected or actual output', async () => {
        runMock.mockResolvedValueOnce({
            codingTaskId: taskId,
            language: 'python',
            execution: {
                compilationSuccessful: true,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: [{
                    testCaseId: 'H1',
                    name: 'Hidden case',
                    status: 'PASSED' as const,
                    passed: true,
                    isHidden: true,
                    expectedOutput: 'secret-expected',
                    actualOutput: 'secret-actual'
                }]
            },
            evaluation: { score: 90 },
            evaluationError: null,
            canSubmit: true
        });
        createMock.mockResolvedValue({
            _id: 'submission-3',
            score: 90,
            submittedAt: new Date()
        });

        await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(createMock.mock.calls[0][0].testResults[0]).toEqual({
            testCaseId: 'H1',
            name: 'Hidden case',
            status: 'PASSED',
            passed: true,
            isHidden: true,
            expectedOutput: '',
            actualOutput: '',
            error: null
        });
        expect(JSON.stringify(createMock.mock.calls[0][0])).not.toContain(
            'secret'
        );
    });

    it('requests advisory review when the Run result has none and stores its score', async () => {
        runMock.mockResolvedValueOnce({
            codingTaskId: taskId,
            language: 'python',
            execution: {
                compilationSuccessful: true,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: null,
            evaluationError: null,
            canSubmit: true
        });
        findByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    taskName: 'Sum',
                    taskDescription: 'Add two numbers'
                })
            })
        });
        reviewMock.mockResolvedValue({
            feedback: {
                score: 77,
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
        createMock.mockResolvedValue({
            _id: 'submission-4',
            score: 77,
            submittedAt: new Date()
        });

        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(reviewMock).toHaveBeenCalledTimes(1);
        expect(createMock.mock.calls[0][0].score).toBe(77);
        expect(result.submission?.score).toBe(77);
    });

    it('rejects results that belong to a different language', async () => {
        runMock.mockResolvedValueOnce({
            codingTaskId: taskId,
            language: 'javascript',
            execution: {
                compilationSuccessful: true,
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: { score: 100 },
            evaluationError: null,
            canSubmit: true
        });

        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(result).toEqual({
            submitted: false,
            canSubmit: false,
            message:
                'Your latest execution results do not match this submission. Please run the code again.'
        });
        expect(createMock).not.toHaveBeenCalled();
    });

    it('rejects results whose counts are inconsistent with the executed cases', async () => {
        runMock.mockResolvedValueOnce({
            codingTaskId: taskId,
            language: 'python',
            execution: {
                compilationSuccessful: true,
                totalTests: 2,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: { score: 100 },
            evaluationError: null,
            canSubmit: true
        });

        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(result).toEqual({
            submitted: false,
            canSubmit: false,
            message:
                'Your latest execution results do not match this submission. Please run the code again.'
        });
        expect(createMock).not.toHaveBeenCalled();
    });

    it('propagates the language validation performed by the Run service', async () => {
        runMock.mockRejectedValueOnce(new Error('INVALID_LANGUAGE'));

        await expect(
            submitCourseTaskCodeService.submitCourseTaskCode(
                taskId,
                'Python',
                'print(4)',
                userId
            )
        ).rejects.toThrow('INVALID_LANGUAGE');

        expect(createMock).not.toHaveBeenCalled();
    });

    it('requires a fresh run when execution hit an infrastructure error', async () => {
        runMock.mockResolvedValueOnce({
            codingTaskId: taskId,
            language: 'python',
            execution: {
                compilationSuccessful: true,
                infrastructureError: 'Compilation service unavailable',
                totalTests: 1,
                passedTests: 1,
                failedTests: 0,
                allTestsPassed: true,
                testResults: results
            },
            evaluation: null,
            evaluationError: null,
            canSubmit: true
        });

        const result = await submitCourseTaskCodeService.submitCourseTaskCode(
            taskId,
            'Python',
            'print(4)',
            userId
        );

        expect(result).toEqual({
            submitted: false,
            canSubmit: false,
            message:
                'Please run the code against the test cases before submitting.'
        });
        expect(createMock).not.toHaveBeenCalled();
    });
});
