import { Request, Response } from 'express';
import submitCodeController from '../../../controllers/common/submitCodeController';
import runCodeService from '../../../services/common/runCodeService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { CODING_QUESTION_ERROR_MESSAGES, CODING_QUESTION_SUCCESS_MESSAGES } from '../../../constants/common/codingQuestionMessages';

jest.mock('../../../services/common/runCodeService', () => ({
    __esModule: true,
    default: { runCode: jest.fn() }
}));

const runCodeMock = runCodeService.runCode as unknown as jest.Mock;

describe('submitCodeController', () => {
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

    it('passes the selected programming language ID to the service', async () => {
        const questionId = '66d323456789abcdef123456';
        const languageId = '65f1a2b3c4d5e6f7890abcd1';
        const code = 'console.log("Hello");';
        const executionResult = { questionId, language: 'javascript' };
        const req = {
            body: { questionId, language: languageId, code },
            user: { userId: '65f1a2b3c4d5e6f7890abcd2' }
        } as unknown as Request;
        runCodeMock.mockResolvedValue({ success: true, executionResult, lastSubmission: null });

        await submitCodeController.submitCode(req, res);

        expect(runCodeMock).toHaveBeenCalledWith(
            questionId,
            languageId,
            code,
            '65f1a2b3c4d5e6f7890abcd2',
            'submit'
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: CODING_QUESTION_SUCCESS_MESSAGES.SUBMIT_CODE_SUCCESS_MESSAGE,
            data: executionResult,
            lastSubmission: null
        });
    });

    it('returns the last code the employee ran alongside the result', async () => {
        const questionId = '66d323456789abcdef123456';
        const languageId = '65f1a2b3c4d5e6f7890abcd1';
        const employeeId = '65f1a2b3c4d5e6f7890abcd2';
        const executionResult = { questionId, language: 'javascript' };
        const lastSubmission = {
            employeeId,
            questionId: '65f1a2b3c4d5e6f7890abcd3',
            languageId,
            code: 'console.log(42);',
            passedTestCases: 3,
            failedTestCases: 0,
            score: 100,
            status: 'SOME_FAILED',
            type: 'run'
        };
        const req = {
            body: { questionId, language: languageId, code: 'console.log(1);' },
            user: { userId: employeeId }
        } as unknown as Request;
        runCodeMock.mockResolvedValue({ success: true, executionResult, lastSubmission });

        await submitCodeController.submitCode(req, res);

        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: CODING_QUESTION_SUCCESS_MESSAGES.SUBMIT_CODE_SUCCESS_MESSAGE,
            data: executionResult,
            lastSubmission
        });
    });

    it('returns 400 when the language ID is missing', async () => {
        const req = {
            body: { questionId: '66d323456789abcdef123456', code: 'console.log("Hello");' }
        } as unknown as Request;

        await submitCodeController.submitCode(req, res);

        expect(runCodeMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: CODING_QUESTION_ERROR_MESSAGES.RUN_CODE_MISSING_FIELDS_MESSAGE
        });
    });
});
