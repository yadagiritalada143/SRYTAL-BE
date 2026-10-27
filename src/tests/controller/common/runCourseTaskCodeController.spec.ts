import { Request, Response } from 'express';
import runCourseTaskCodeController from '../../../controllers/common/runCourseTaskCodeController';
import runCourseTaskCodeService from '../../../services/common/runCourseTaskCodeService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    CODING_TASK_ERROR_MESSAGES,
    CODING_TASK_SUCCESS_MESSAGES
} from '../../../constants/common/codingTaskMessages';

jest.mock('../../../services/common/runCourseTaskCodeService', () => ({
    __esModule: true,
    default: { runCourseTaskCode: jest.fn() }
}));

const runMock = runCourseTaskCodeService.runCourseTaskCode as unknown as jest.Mock;

const validTaskId = '66d323456789abcdef123456';
const validUserId = '65f1a2b3c4d5e6f7890abcd2';

const makeRes = (): { res: Response; mockStatus: jest.Mock; mockJson: jest.Mock } => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const res = { status: mockStatus, json: mockJson } as unknown as Response;
    return { res, mockStatus, mockJson };
};

const makeReq = (
    body: Record<string, unknown>,
    user: { userId?: string } | undefined = { userId: validUserId }
): Request => ({ body, user } as unknown as Request);

const serviceResult = (
    status: string,
    overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
    codingTaskId: validTaskId,
    language: 'cpp',
    execution: {
        compilationSuccessful: true,
        infrastructureError: null,
        retryAfterSeconds: null,
        totalTests: 1,
        passedTests: status === 'PASSED' ? 1 : 0,
        failedTests: status === 'PASSED' ? 0 : 1,
        allTestsPassed: status === 'PASSED',
        testResults: [
            {
                testCaseId: 'TC001',
                name: 'Basic case',
                status,
                passed: status === 'PASSED',
                expectedOutput: '4\n',
                actualOutput: '4',
                error: null
            }
        ]
    },
    evaluation: null,
    evaluationError: null,
    canSubmit: status === 'PASSED',
    ...overrides
});

describe('runCourseTaskCodeController', () => {
    beforeEach(() => {
        runMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('runs a valid request and returns the service result', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const result = serviceResult('PASSED');
        runMock.mockResolvedValue(result);

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(runMock).toHaveBeenCalledWith(
            validTaskId,
            'cpp',
            'int main(){}',
            validUserId
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: CODING_TASK_SUCCESS_MESSAGES.RUN_CODE_SUCCESS_MESSAGE,
            data: result
        });
    });

    it('returns AI evaluation feedback alongside the execution results', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const evaluation = {
            score: 75,
            suggestions: ['Handle the empty-input case.'],
            codingStandards: {
                readability: 'ok',
                efficiency: 'O(n) time, O(1) space',
                errorHandling: 'ok',
                namingConventions: 'ok'
            },
            explanation: 'One visible case fails.'
        };
        runMock.mockResolvedValue(serviceResult('WRONG_OUTPUT', {
            evaluation,
            evaluationError: null
        }));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const payload = mockJson.mock.calls[0][0];
        expect(payload.data.evaluation).toEqual(evaluation);
        expect(payload.data.evaluationError).toBeNull();
        expect(payload.data.execution.failedTests).toBe(1);
    });

    it('accepts the legacy `language` field as a languageId alias', async () => {
        const { res } = makeRes();
        runMock.mockResolvedValue(serviceResult('PASSED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, language: 'python', sourceCode: 'print(4)' }),
            res
        );

        expect(runMock).toHaveBeenCalledWith(
            validTaskId,
            'python',
            'print(4)',
            validUserId
        );
    });

    it('returns 400 when taskId is missing', async () => {
        const { res, mockStatus, mockJson } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: CODING_TASK_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            })
        );
    });

    it('returns 400 when taskId is not a valid 24-hex id', async () => {
        const { res, mockStatus } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: 'not-an-id', languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 400 when neither languageId nor language is provided', async () => {
        const { res, mockStatus } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, sourceCode: 'int main(){}' }),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 400 when sourceCode is missing', async () => {
        const { res, mockStatus } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp' }),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 400 when sourceCode is empty', async () => {
        const { res, mockStatus } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: '' }),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 400 when languageId is null and no language alias is provided', async () => {
        const { res, mockStatus } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: null, sourceCode: 'int main(){}' }),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 401 when the request is not authenticated', async () => {
        const { res, mockStatus, mockJson } = makeRes();

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq(
                { taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' },
                {}
            ),
            res
        );

        expect(runMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
        });
    });

    it('maps a non-CODE task to 400', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('NOT_CODING_TASK'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.NOT_CODING_TASK_MESSAGE
        });
    });

    it('maps a missing task name to 400', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('CODING_TASK_NAME_REQUIRED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.CODING_TASK_NAME_REQUIRED_MESSAGE
        });
    });

    it('maps a missing task description to 400', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('CODING_TASK_DESCRIPTION_REQUIRED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.CODING_TASK_DESCRIPTION_REQUIRED_MESSAGE
        });
    });

    it('maps an unassigned user to 403', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('TASK_NOT_ASSIGNED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.TASK_NOT_ASSIGNED_MESSAGE
        });
    });

    it('maps an unsupported language to 400', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('INVALID_LANGUAGE'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'unknown', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
        });
    });

    it('passes through a Wandbox compilation failure as a 200 result', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const result = serviceResult('COMPILE_ERROR', {
            execution: {
                ...(serviceResult('COMPILE_ERROR').execution as Record<string, unknown>),
                compilationSuccessful: false
            }
        });
        runMock.mockResolvedValue(result);

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const payload = mockJson.mock.calls[0][0];
        expect(payload.data.execution.testResults[0].status).toBe('COMPILE_ERROR');
        expect(payload.data.execution.compilationSuccessful).toBe(false);
        expect(payload.data.execution.infrastructureError).toBeNull();
    });

    it('passes through a Wandbox runtime failure as a 200 result', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const result = serviceResult('RUNTIME_ERROR');
        (result.execution as Record<string, unknown>).testResults = [
            {
                testCaseId: 'TC001',
                name: 'Basic case',
                status: 'RUNTIME_ERROR',
                passed: false,
                expectedOutput: '4\n',
                actualOutput: '',
                error: 'runtime crash'
            }
        ];
        runMock.mockResolvedValue(result);

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const payload = mockJson.mock.calls[0][0];
        expect(payload.data.execution.testResults[0].status).toBe('RUNTIME_ERROR');
        expect(payload.data.canSubmit).toBe(false);
    });

    it('passes through a Wandbox infrastructure (rate-limit) error as a 200 result', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const result = serviceResult('REQUEST_ERROR', {
            execution: {
                ...(serviceResult('REQUEST_ERROR').execution as Record<string, unknown>),
                infrastructureError: 'The code execution service is rate limited.',
                retryAfterSeconds: 30
            }
        });
        runMock.mockResolvedValue(result);

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const payload = mockJson.mock.calls[0][0];
        expect(payload.data.execution.infrastructureError).toContain('rate limited');
        expect(payload.data.execution.retryAfterSeconds).toBe(30);
    });

    it('returns only the executed test case and never exposes hidden inputs', async () => {
        const { res, mockJson } = makeRes();
        const result = serviceResult('WRONG_OUTPUT');
        (result.execution as Record<string, unknown>).testResults = [
            {
                testCaseId: 'TC001',
                name: 'Basic case',
                status: 'WRONG_OUTPUT',
                passed: false,
                expectedOutput: '4\n',
                actualOutput: '5',
                error: null
            }
        ];
        runMock.mockResolvedValue(result);

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){return 5;}' }),
            res
        );

        const payload = mockJson.mock.calls[0][0];
        expect(payload.data.execution.totalTests).toBe(1);
        expect(payload.data.execution.testResults).toHaveLength(1);

        const serialized = JSON.stringify(payload);
        expect(serialized).not.toContain('"input"');
        expect(serialized).not.toContain('"testCaseInput"');
    });

    it('returns the expected output for a visible test case', async () => {
        const { res, mockJson } = makeRes();
        runMock.mockResolvedValue(serviceResult('PASSED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        const [testResult] = mockJson.mock.calls[0][0].data.execution.testResults;
        expect(testResult.isHidden).toBeUndefined();
        expect(testResult.expectedOutput).toBe('4\n');
        expect(testResult.actualOutput).toBe('4');
    });

    it('never exposes expected/actual output for a hidden executed test case', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const result = serviceResult('PASSED');
        (result.execution as Record<string, unknown>).testResults = [
            {
                testCaseId: 'TC001',
                name: 'Hidden test case',
                status: 'PASSED',
                passed: true,
                isHidden: true
            }
        ];
        runMock.mockResolvedValue(result);

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'int main(){}' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const [testResult] = mockJson.mock.calls[0][0].data.execution.testResults;
        expect(testResult.isHidden).toBe(true);
        expect(testResult).not.toHaveProperty('expectedOutput');
        expect(testResult).not.toHaveProperty('actualOutput');
        expect(testResult).not.toHaveProperty('error');
        expect(testResult).not.toHaveProperty('input');
        expect(testResult).not.toHaveProperty('testCaseInput');
    });

    it('maps a not-yet-generated test suite to 404', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('TEST_CASES_NOT_GENERATED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.TEST_CASES_NOT_GENERATED_MESSAGE
        });
    });

    it('maps a test-case generation failure to 502', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        runMock.mockRejectedValue(new Error('TEST_CASES_GENERATION_FAILED'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_GATEWAY);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
        });
    });

    it('maps an OpenRouter account limit to 400', async () => {
        const { res, mockStatus } = makeRes();
        runMock.mockRejectedValue(new Error('OPENROUTER_ACCOUNT_LIMIT'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('maps an OpenRouter generation timeout to 504', async () => {
        const { res, mockStatus } = makeRes();
        runMock.mockRejectedValue(new Error('OPENROUTER_TEST_CASE_GENERATION_TIMEOUT'));

        await runCourseTaskCodeController.runCourseTaskCode(
            makeReq({ taskId: validTaskId, languageId: 'cpp', sourceCode: 'x' }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.GATEWAY_TIMEOUT);
    });
});
