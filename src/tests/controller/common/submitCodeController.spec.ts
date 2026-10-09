import { Request, Response } from 'express';
import submitCodeController from '../../../controllers/common/submitCodeController';
import submitCourseTaskCodeService from '../../../services/common/submitCourseTaskCodeService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { CODING_TASK_ERROR_MESSAGES } from '../../../constants/common/codingTaskMessages';

jest.mock('../../../services/common/submitCourseTaskCodeService', () => ({
    __esModule: true,
    default: { submitCourseTaskCode: jest.fn() }
}));

const submitMock =
    submitCourseTaskCodeService.submitCourseTaskCode as unknown as jest.Mock;

describe('submitCodeController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        submitMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('passes the task, language, source and user to the service', async () => {
        const taskId = '66d323456789abcdef123456';
        const languageId = '65f1a2b3c4d5e6f7890abcd1';
        const sourceCode = 'console.log("Hello");';
        const userId = '65f1a2b3c4d5e6f7890abcd2';
        const result = {
            submitted: true,
            canSubmit: true,
            message: 'Coding task submitted successfully.',
            submission: {
                id: 'submission-1',
                score: 95,
                submittedAt: new Date(),
                status: 'SUBMITTED'
            }
        };
        const req = {
            body: { codingTaskId: taskId, languageId, sourceCode },
            user: { userId }
        } as unknown as Request;
        submitMock.mockResolvedValue(result);

        await submitCodeController.submitCode(req, res);

        expect(submitMock).toHaveBeenCalledWith(
            taskId,
            languageId,
            sourceCode,
            userId
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: result.message,
            data: result
        });
    });

    it('accepts taskId and language aliases', async () => {
        const taskId = '66d323456789abcdef123456';
        const sourceCode = 'print(1)';
        const userId = '65f1a2b3c4d5e6f7890abcd2';
        submitMock.mockResolvedValue({
            submitted: false,
            canSubmit: false,
            message: 'Please fix the failed test cases before submitting.'
        });
        const req = {
            body: { taskId, language: 'Python', sourceCode },
            user: { userId }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(submitMock).toHaveBeenCalledWith(
            taskId,
            'Python',
            sourceCode,
            userId
        );
    });

    it('returns 400 when the source code is missing', async () => {
        const req = {
            body: { codingTaskId: '66d323456789abcdef123456', language: 'Python' },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(submitMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message:
                    CODING_TASK_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
            })
        );
    });

    it('returns 401 when there is no authenticated user', async () => {
        const req = {
            body: {
                codingTaskId: '66d323456789abcdef123456',
                language: 'Python',
                sourceCode: 'print(1)'
            }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(submitMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message:
                CODING_TASK_ERROR_MESSAGES.USER_AUTHENTICATION_REQUIRED_MESSAGE
        });
    });

    it('maps an invalid task id error to 400', async () => {
        submitMock.mockRejectedValue(new Error('INVALID_TASK_ID'));
        const req = {
            body: {
                codingTaskId: 'bad-id',
                language: 'Python',
                sourceCode: 'print(1)'
            },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('maps a missing task error to 404', async () => {
        submitMock.mockRejectedValue(new Error('COURSE_TASK_NOT_FOUND'));
        const req = {
            body: {
                codingTaskId: '66d323456789abcdef123456',
                language: 'Python',
                sourceCode: 'print(1)'
            },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('maps a persistence failure to 500', async () => {
        submitMock.mockRejectedValue(new Error('SUBMISSION_SAVE_FAILED'));
        const req = {
            body: {
                codingTaskId: '66d323456789abcdef123456',
                language: 'Python',
                sourceCode: 'print(1)'
            },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(mockStatus).toHaveBeenCalledWith(
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
    });
});
