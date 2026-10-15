import { Request, Response } from 'express';
import generateCourseTaskTestCasesController from '../../../controllers/common/generateCourseTaskTestCasesController';
import generateCourseTaskTestCasesService from '../../../services/common/generateCourseTaskTestCasesService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import {
    CODING_TASK_ERROR_MESSAGES,
    CODING_TASK_SUCCESS_MESSAGES
} from '../../../constants/common/codingTaskMessages';

jest.mock('../../../services/common/generateCourseTaskTestCasesService', () => ({
    __esModule: true,
    default: { generateCourseTaskTestCases: jest.fn() }
}));

const generateMock =
    generateCourseTaskTestCasesService.generateCourseTaskTestCases as unknown as jest.Mock;

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

const serviceResult = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    taskId: validTaskId,
    generated: true,
    reused: false,
    testCaseCount: 4,
    generatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
});

describe('generateCourseTaskTestCasesController', () => {
    beforeEach(() => {
        generateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('generates test cases and returns the service result with 200', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        const result = serviceResult();
        generateMock.mockResolvedValue(result);

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: validTaskId }),
            res
        );

        expect(generateMock).toHaveBeenCalledWith(validTaskId, validUserId, false);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: CODING_TASK_SUCCESS_MESSAGES.TEST_CASES_GENERATED_SUCCESS_MESSAGE,
            data: result
        });
    });

    it('uses the reuse message when saved test cases are reused', async () => {
        const { res, mockJson } = makeRes();
        generateMock.mockResolvedValue(
            serviceResult({ generated: false, reused: true })
        );

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: validTaskId }),
            res
        );

        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                message: CODING_TASK_SUCCESS_MESSAGES.TEST_CASES_REUSED_SUCCESS_MESSAGE
            })
        );
    });

    it('forwards forceRegenerate to the service', async () => {
        const { res } = makeRes();
        generateMock.mockResolvedValue(serviceResult());

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: validTaskId, forceRegenerate: true }),
            res
        );

        expect(generateMock).toHaveBeenCalledWith(validTaskId, validUserId, true);
    });

    it('returns 400 when taskId is missing and never calls the service', async () => {
        const { res, mockStatus, mockJson } = makeRes();

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({}),
            res
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message:
                    CODING_TASK_ERROR_MESSAGES.INVALID_TEST_CASE_GENERATION_REQUEST_MESSAGE
            })
        );
    });

    it('returns 400 when taskId is not a valid 24-hex id', async () => {
        const { res, mockStatus } = makeRes();

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: 'not-an-id' }),
            res
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 401 when the request is not authenticated', async () => {
        const { res, mockStatus, mockJson } = makeRes();

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: validTaskId }, {}),
            res
        );

        expect(generateMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
        });
    });

    it.each([
        ['INVALID_TASK_ID', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.INVALID_TEST_CASE_GENERATION_REQUEST_MESSAGE],
        ['COURSE_TASK_NOT_FOUND', HTTP_STATUS.NOT_FOUND,
            CODING_TASK_ERROR_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE],
        ['NOT_CODING_TASK', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.NOT_CODING_TASK_MESSAGE],
        ['CODING_TASK_NAME_REQUIRED', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.CODING_TASK_NAME_REQUIRED_MESSAGE],
        ['CODING_TASK_DESCRIPTION_REQUIRED', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.CODING_TASK_DESCRIPTION_REQUIRED_MESSAGE],
        ['TASK_NOT_ASSIGNED', HTTP_STATUS.FORBIDDEN,
            CODING_TASK_ERROR_MESSAGES.TASK_NOT_ASSIGNED_MESSAGE],
        ['OPENROUTER_KEY_NOT_FOUND', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_NOT_FOUND_MESSAGE],
        ['OPENROUTER_KEY_INVALID', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.OPENROUTER_KEY_INVALID_MESSAGE],
        ['OPENROUTER_ACCOUNT_LIMIT', HTTP_STATUS.BAD_REQUEST,
            CODING_TASK_ERROR_MESSAGES.OPENROUTER_ACCOUNT_LIMIT_MESSAGE],
        ['TEST_CASES_GENERATION_IN_PROGRESS', HTTP_STATUS.CONFLICT,
            CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE],
        ['INVALID_GENERATED_TEST_CASES', HTTP_STATUS.BAD_GATEWAY,
            CODING_TASK_ERROR_MESSAGES.INVALID_GENERATED_TEST_CASES_MESSAGE],
        ['STORED_TEST_CASES_INVALID', HTTP_STATUS.BAD_GATEWAY,
            CODING_TASK_ERROR_MESSAGES.INVALID_GENERATED_TEST_CASES_MESSAGE],
        ['OPENROUTER_TEST_CASE_GENERATION_TIMEOUT', HTTP_STATUS.GATEWAY_TIMEOUT,
            CODING_TASK_ERROR_MESSAGES.OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE],
        ['TEST_CASES_GENERATION_FAILED', HTTP_STATUS.BAD_GATEWAY,
            CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE]
    ])('maps %s to the expected HTTP response', async (errorCode, status, message) => {
        const { res, mockStatus, mockJson } = makeRes();
        generateMock.mockRejectedValue(new Error(errorCode as string));

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: validTaskId }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(status);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message
        });
    });

    it('returns 500 for an unexpected error', async () => {
        const { res, mockStatus, mockJson } = makeRes();
        generateMock.mockRejectedValue(new Error('SOMETHING_UNEXPECTED'));

        await generateCourseTaskTestCasesController.generateCourseTaskTestCases(
            makeReq({ taskId: validTaskId }),
            res
        );

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_TASK_ERROR_MESSAGES.TEST_CASES_GENERATION_FAILED_MESSAGE
        });
    });
});
