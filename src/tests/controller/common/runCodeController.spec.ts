import { Request, Response } from 'express';
import runCodeController from '../../../controllers/common/runCodeController';
import runCodeService from '../../../services/common/runCodeService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { CODING_QUESTION_ERROR_MESSAGES, CODING_QUESTION_SUCCESS_MESSAGES } from '../../../constants/common/codingTaskMessages';

jest.mock('../../../services/common/runCodeService', () => ({
    __esModule: true,
    default: { runCode: jest.fn() }
}));

const runCodeMock = runCodeService.runCode as unknown as jest.Mock;

describe('runCodeController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        runCodeMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('passes the task, question and language ID to the service', async () => {
        const taskId = '66d323456789abcdef123456';
        const questionId = '66d323456789abcdef123499';
        const languageId = '65f1a2b3c4d5e6f7890abcd1';
        const code = 'console.log("Hello");';
        const executionResult = { taskId, questionId, language: 'javascript' };
        const req = {
            body: { taskId, questionId, language: languageId, code },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;
        runCodeMock.mockResolvedValue({ success: true, executionResult });

        await runCodeController.runCode(req, res);

        expect(runCodeMock).toHaveBeenCalledWith(
            taskId,
            questionId,
            languageId,
            code,
            '65f1a2b3c4d5e6f7890abcd2',
            'run'
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: CODING_QUESTION_SUCCESS_MESSAGES.RUN_CODE_SUCCESS_MESSAGE,
            data: executionResult
        });
    });

    it('treats a lone questionId as the task id for pre-multi-question clients', async () => {
        const taskId = '66d323456789abcdef123456';
        const languageId = '65f1a2b3c4d5e6f7890abcd1';
        const req = {
            body: { questionId: taskId, language: languageId, code: 'console.log("Hello");' },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;
        runCodeMock.mockResolvedValue({ success: true, executionResult: { taskId, questionId: null } });

        await runCodeController.runCode(req, res);

        expect(runCodeMock).toHaveBeenCalledWith(
            taskId,
            '',
            languageId,
            'console.log("Hello");',
            '65f1a2b3c4d5e6f7890abcd2',
            'run'
        );
    });

    it('returns 400 when questionId is missing', async () => {
        const req = {
            body: { language: '65f1a2b3c4d5e6f7890abcd1', code: 'console.log("Hello");' }
        } as unknown as Request;

        await runCodeController.runCode(req, res);

        expect(runCodeMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    });

    it('returns 400 when the language ID is missing', async () => {
        const req = {
            body: { questionId: '66d323456789abcdef123456', code: 'console.log("Hello");' }
        } as unknown as Request;

        await runCodeController.runCode(req, res);

        expect(runCodeMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 400 when the selected language ID is invalid', async () => {
        const req = {
            body: {
                questionId: '66d323456789abcdef123456',
                language: '65f1a2b3c4d5e6f7890abcd1',
                code: 'console.log("Hello");'
            },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;
        runCodeMock.mockResolvedValue({ success: false, invalidLanguage: true });

        await runCodeController.runCode(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.INVALID_LANGUAGE_MESSAGE
        });
    });
});
