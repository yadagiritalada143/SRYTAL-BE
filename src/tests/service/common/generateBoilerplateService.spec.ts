import axios from 'axios';
import { Types } from 'mongoose';
import generateBoilerplateService from '../../../services/common/generateBoilerplateService';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';

jest.mock('axios', () => ({
    post: jest.fn()
}));

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn() }
}));

jest.mock('../../../services/useropenrouter/getUserOpenRouterKeyService', () => ({
    __esModule: true,
    default: { getUserOpenRouterKeyService: jest.fn() }
}));

const axiosPostMock = axios.post as jest.Mock;
const taskQuestionFindOneMock =
    (TaskCodingQuestionModel as unknown as { findOne: jest.Mock }).findOne;
const taskQuestionUpdateOneMock =
    (TaskCodingQuestionModel as unknown as { updateOne: jest.Mock }).updateOne;
const getUserOpenRouterKeyMock =
    getUserOpenRouterKeyService.getUserOpenRouterKeyService as unknown as jest.Mock;

const taskId = '66d323456789abcdef123456';
const questionId = '66d323456789abcdef123457';
const languageId = '66d323456789abcdef123458';
const question = {
    _id: questionId,
    taskId,
    question: 'Given an integer array nums...',
    description: 'Return the modified array.',
    status: 'ACTIVE',
    starterCode: []
};

const mockQuestion = (result: any = question) => {
    taskQuestionFindOneMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result)
    });
};

describe('generateBoilerplateService.getOrGenerateBoilerplate', () => {
    beforeEach(() => {
        axiosPostMock.mockReset();
        taskQuestionFindOneMock.mockReset();
        taskQuestionUpdateOneMock.mockReset();
        getUserOpenRouterKeyMock.mockReset();
        mockQuestion();
        getUserOpenRouterKeyMock.mockResolvedValue({
            _id: '1',
            userId: 'u1',
            openrouterKey: 'sk-test'
        });
        taskQuestionUpdateOneMock
            .mockResolvedValueOnce({ matchedCount: 0 })
            .mockResolvedValue({ matchedCount: 1 });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns cached starter code for the selected language ID', async () => {
        mockQuestion({
            ...question,
            starterCode: [{
                languageId,
                code: 'function f() {}',
                boilerplateVersion: 2
            }]
        });

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(
            taskId,
            questionId,
            'u1',
            'javascript',
            languageId
        );

        expect(result).toBe('function f() {}');
        expect(taskQuestionFindOneMock.mock.results[0].value.select)
            .toHaveBeenCalledWith('+starterCode.boilerplateVersion');
        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(taskQuestionUpdateOneMock).not.toHaveBeenCalled();
    });

    it('generates and stores starter code on the separate question document', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{
                    message: {
                        content: '{"code": "var removeDuplicates = function(nums) {\\n};"}'
                    }
                }]
            }
        });

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(
            taskId,
            questionId,
            'u1',
            'javascript',
            languageId
        );

        expect(result).toContain('var removeDuplicates = function(nums)');
        expect(axiosPostMock.mock.calls[0][1].model).toBe(
            process.env.OPENROUTER_MODEL?.trim() || 'openrouter/auto'
        );
        expect(axiosPostMock).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer sk-test'
                })
            })
        );
        expect(taskQuestionFindOneMock).toHaveBeenCalledWith({
            _id: new Types.ObjectId(questionId),
            taskId: new Types.ObjectId(taskId),
            status: 'ACTIVE'
        });
        expect(taskQuestionUpdateOneMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                _id: new Types.ObjectId(questionId),
                taskId: new Types.ObjectId(taskId),
                'starterCode.languageId': new Types.ObjectId(languageId)
            }),
            {
                $set: {
                    'starterCode.$.code': result,
                    'starterCode.$.boilerplateVersion': 2
                }
            }
        );
        expect(taskQuestionUpdateOneMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                _id: new Types.ObjectId(questionId),
                taskId: new Types.ObjectId(taskId),
                'starterCode.languageId': {
                    $ne: new Types.ObjectId(languageId)
                }
            }),
            {
                $push: {
                    starterCode: {
                        languageId: new Types.ObjectId(languageId),
                        code: result,
                        boilerplateVersion: 2
                    }
                }
            }
        );
        const prompt = axiosPostMock.mock.calls[0][1].messages[1].content;
        expect(prompt).toContain('Do NOT include sample input');
        expect(prompt).toContain('Do NOT invoke the function from a main method');
    });

    it('regenerates starter code from an older cached version', async () => {
        mockQuestion({
            ...question,
            starterCode: [{
                languageId,
                code: 'function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }',
                boilerplateVersion: 1
            }]
        });
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{
                    message: {
                        content: '{"code": "function factorial(n) {\\n    // TODO: implement\\n}"}'
                    }
                }]
            }
        });

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(
            taskId,
            questionId,
            'u1',
            'javascript',
            languageId
        );

        expect(result).toContain('// TODO: implement');
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
    });

    it('deduplicates concurrent generations for the same question and language', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{
                    message: {
                        content: '{"code": "class Solution {}"}'
                    }
                }]
            }
        });

        const [first, second] = await Promise.all([
            generateBoilerplateService.getOrGenerateBoilerplate(
                taskId, questionId, 'u1', 'python', languageId
            ),
            generateBoilerplateService.getOrGenerateBoilerplate(
                taskId, questionId, 'u1', 'python', languageId
            )
        ]);

        expect(first).toBe('class Solution {}');
        expect(second).toBe(first);
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(taskQuestionUpdateOneMock).toHaveBeenCalledTimes(2);
    });

    it('surfaces an OpenRouter key lookup failure without caching a result', async () => {
        getUserOpenRouterKeyMock.mockRejectedValue(
            new Error('OPENROUTER_KEY_NOT_FOUND')
        );

        await expect(
            generateBoilerplateService.getOrGenerateBoilerplate(
                taskId, questionId, 'u1', 'python', languageId
            )
        ).rejects.toThrow('OPENROUTER_KEY_NOT_FOUND');
        expect(taskQuestionUpdateOneMock).not.toHaveBeenCalled();
    });

    it('rejects an OpenRouter key containing header line breaks', async () => {
        getUserOpenRouterKeyMock.mockResolvedValue({
            openrouterKey: 'sk-test\r\nInjected: value'
        });

        await expect(
            generateBoilerplateService.getOrGenerateBoilerplate(
                taskId, questionId, 'u1', 'python', languageId
            )
        ).rejects.toThrow('OPENROUTER_API_KEY_INVALID_FORMAT');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('rejects a question that does not belong to the task', async () => {
        mockQuestion(null);

        await expect(
            generateBoilerplateService.getOrGenerateBoilerplate(
                taskId, questionId, 'u1', 'python', languageId
            )
        ).rejects.toThrow('TASK_OR_QUESTION_NOT_FOUND');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });
});

describe('generateBoilerplateService.extractBoilerplateCode', () => {
    it('parses a JSON object with a code field', () => {
        expect(
            generateBoilerplateService.extractBoilerplateCode(
                '{"code": "def f():\\n    pass"}',
                'python'
            )
        ).toBe('def f():\n    pass');
    });

    it('strips markdown fences from the code', () => {
        expect(
            generateBoilerplateService.extractBoilerplateCode(
                '```python\nclass Solution:\n    pass\n```',
                'python'
            )
        ).toBe('class Solution:\n    pass');
    });

    it('returns plain source code', () => {
        const code = 'def f():\n    pass';
        expect(
            generateBoilerplateService.extractBoilerplateCode(code, 'python')
        ).toBe(code);
    });
});
