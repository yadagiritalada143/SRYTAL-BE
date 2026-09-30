import axios from 'axios';
import generateBoilerplateService from '../../../services/common/generateBoilerplateService';
import CourseTaskModel from '../../../model/courseTaskModel';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';
import { resolveStarterCode } from '../../../util/languageUtils';

jest.mock('axios', () => ({
    post: jest.fn()
}));

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

jest.mock('../../../services/useropenrouter/getUserOpenRouterKeyService', () => ({
    __esModule: true,
    default: { getUserOpenRouterKeyService: jest.fn() }
}));

jest.mock('../../../util/languageUtils', () => ({
    resolveStarterCode: jest.fn()
}));

const axiosPostMock = (axios.post as unknown as jest.Mock);
const courseTaskUpdateOneMock = (CourseTaskModel as unknown as { updateOne: jest.Mock }).updateOne;
const getUserOpenRouterKeyMock = getUserOpenRouterKeyService.getUserOpenRouterKeyService as unknown as jest.Mock;
const resolveStarterCodeMock = resolveStarterCode as unknown as jest.Mock;

const task = {
    _id: '66d323456789abcdef123456',
    taskName: 'Remove Duplicates from Sorted Array II',
    question: 'Given an integer array nums...',
    starterCode: []
};

// A task with no questionId is a legacy single-question task, so its starter code
// is still cached on the top-level field.
const question = {
    questionId: null,
    question: 'Given an integer array nums...',
    description: '',
    status: 'ACTIVE',
    order: 0,
    starterCode: []
};

const userOpenRouterKey = { _id: '1', userId: 'u1', openrouterKey: 'sk-test' };

describe('generateBoilerplateService.getOrGenerateBoilerplate', () => {
    beforeEach(() => {
        axiosPostMock.mockReset();
        courseTaskUpdateOneMock.mockReset();
        getUserOpenRouterKeyMock.mockReset();
        resolveStarterCodeMock.mockReset();
        getUserOpenRouterKeyMock.mockResolvedValue(userOpenRouterKey);
        courseTaskUpdateOneMock.mockResolvedValue({});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the cached writer starter without calling OpenRouter', async () => {
        resolveStarterCodeMock.mockReturnValue('function f() {}');

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'javascript', 'u1');

        expect(result).toBe('function f() {}');
        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(courseTaskUpdateOneMock).not.toHaveBeenCalled();
    });

    it('generates a starter via OpenRouter and caches it into the task', async () => {
        resolveStarterCodeMock.mockReturnValue('');
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: '{"code": "var removeDuplicates = function(nums) {\\n};"}' } }] }
        });

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'javascript', 'u1');

        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(result).toContain('var removeDuplicates = function(nums)');
        expect(courseTaskUpdateOneMock).toHaveBeenCalledTimes(2);
        expect(courseTaskUpdateOneMock).toHaveBeenNthCalledWith(
            1,
            { _id: task._id },
            { $pull: { starterCode: { languageName: 'javascript' } } }
        );
        expect(courseTaskUpdateOneMock).toHaveBeenNthCalledWith(
            2,
            { _id: task._id },
            { $push: { starterCode: { languageName: 'javascript', code: result } } }
        );
    });

    it('deduplicates concurrent requests for the same question + language', async () => {
        resolveStarterCodeMock.mockReturnValue('');
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: '{"code": "class Solution {}"}' } }] }
        });

        const [first, second] = await Promise.all([
            generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'python', 'u1'),
            generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'python', 'u1')
        ]);

        expect(first).toBe('class Solution {}');
        expect(second).toBe('class Solution {}');
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(courseTaskUpdateOneMock).toHaveBeenCalledTimes(2);
    });

    it('returns an empty string when the OpenRouter key is missing', async () => {
        resolveStarterCodeMock.mockReturnValue('');
        getUserOpenRouterKeyMock.mockRejectedValue(new Error('OPENROUTER_KEY_NOT_FOUND'));

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'python', 'u1');

        expect(result).toBe('');
        expect(courseTaskUpdateOneMock).not.toHaveBeenCalled();
    });

    it('returns an empty string when OpenRouter returns no content', async () => {
        resolveStarterCodeMock.mockReturnValue('');
        axiosPostMock.mockResolvedValue({ data: { choices: [{ message: { content: '' } }] } });

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'go', 'u1');

        expect(result).toBe('');
        expect(courseTaskUpdateOneMock).not.toHaveBeenCalled();
    });

    it('rejects a reasoning dump that does not look like starter code', async () => {
        resolveStarterCodeMock.mockReturnValue('');
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{
                    message: {
                        content: [
                            'We need answer only JSON object with code string.',
                            'Need infer function signature. For TypeScript, likely function reverseNumber',
                            'The prompt says correct function signature derived from problem.',
                            'Body empty. JSDoc types. The model should output the skeleton.',
                            'But deepseek reasoning continues along these lines for many lines.',
                            'Need decide function name. Common function name: reverseNumber.',
                            'Parameter N: number. Return type: number? Probably yes.',
                            'The instruction says no extra comments, no reasoning.',
                            'But here is a long reasoning paragraph instead of code.',
                            'Let me think about LeetCode style for TypeScript functions.',
                            'Usually function reverse(x: number): number with JSDoc block above.',
                            'The output should be a JSON object but the model ignored it.',
                            'This text keeps going and going and is clearly not code.',
                            'There is no function signature token anywhere in this dump.',
                            'The guard should classify this as not starter code.'
                        ].join('\n')
                    }
                }]
            }
        });

        const result = await generateBoilerplateService.getOrGenerateBoilerplate(task, question, 'typescript', 'u1');

        expect(result).toBe('');
        expect(courseTaskUpdateOneMock).not.toHaveBeenCalled();
    });
});

describe('generateBoilerplateService.extractBoilerplateCode', () => {
    it('parses a JSON object with a code field', () => {
        const content = '{"code": "print(1)"}';
        expect(generateBoilerplateService.extractBoilerplateCode(content)).toBe('print(1)');
    });

    it('strips markdown fences from the code', () => {
        const content = '```python\nclass Solution:\n    pass\n```';
        expect(generateBoilerplateService.extractBoilerplateCode(content)).toBe('class Solution:\n    pass');
    });

    it('returns plain text code as-is', () => {
        const content = 'def f():\n    pass';
        expect(generateBoilerplateService.extractBoilerplateCode(content)).toBe(content);
    });
});