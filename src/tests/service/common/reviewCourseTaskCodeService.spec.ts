import axios from 'axios';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';
import reviewCourseTaskCodeService from '../../../services/common/reviewCourseTaskCodeService';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        isAxiosError: jest.fn()
    }
}));
jest.mock('../../../services/useropenrouter/getUserOpenRouterKeyService', () => ({
    __esModule: true,
    default: { getUserOpenRouterKeyService: jest.fn() }
}));

const userId = '65f1a2b3c4d5e6f7890abcd2';
const apiKey = 'sk-or-test-key';
const review = {
    score: 82,
    suggestions: ['Use a descriptive variable name.'],
    codingStandards: {
        readability: 'good',
        efficiency: 'good',
        errorHandling: 'adequate',
        namingConventions: 'good'
    },
    explanation: 'The solution passes the supplied execution cases.'
};

const axiosPostMock = axios.post as jest.Mock;
const isAxiosErrorMock = axios.isAxiosError as unknown as jest.Mock;
const getKeyMock =
    getUserOpenRouterKeyService.getUserOpenRouterKeyService as jest.Mock;

describe('reviewCourseTaskCodeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getKeyMock.mockResolvedValue({ openrouterKey: apiKey });
        isAxiosErrorMock.mockReturnValue(false);
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{ message: { content: JSON.stringify(review) } }]
            }
        });
    });

    it('sends task, code, language, and actual results to OpenRouter and validates feedback', async () => {
        const actualResults = [{
            testCaseId: 'TC001',
            name: 'Basic',
            passed: false,
            expectedOutput: '2',
            actualOutput: '3',
            error: null
        }];
        const result = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            'Output the given value.',
            'python',
            'print(3)',
            actualResults,
            userId
        );

        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        const [url, payload, options] = axiosPostMock.mock.calls[0];
        expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
        expect(options.headers.Authorization).toBe(`Bearer ${apiKey}`);
        expect(JSON.stringify(payload.messages)).toContain('Output the given value.');
        expect(JSON.stringify(payload.messages)).toContain('print(3)');
        expect(payload.messages[1].content).toContain(JSON.stringify(actualResults));
        expect(JSON.stringify(payload.messages)).toContain('Never change a test case from failed to passed');
        expect(payload.max_tokens).toBe(4000);
        expect(result).toEqual({ feedback: review, error: null });
    });

    it('returns unavailable feedback instead of throwing for malformed model output', async () => {
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: '{"score": 101}' } }] }
        });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            'task',
            'python',
            'code',
            [],
            userId
        );

        expect(result).toEqual({
            feedback: null,
            error: 'Code review feedback is temporarily unavailable.'
        });
        errorSpy.mockRestore();
        warnSpy.mockRestore();
    });

    it('returns unavailable feedback when the user has no OpenRouter key', async () => {
        getKeyMock.mockResolvedValue(null);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            'task',
            'python',
            'code',
            [],
            userId
        );

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(result.feedback).toBeNull();
        expect(result.error).toBeTruthy();
        errorSpy.mockRestore();
    });

    it('does not return the API key or fail execution when OpenRouter rejects the request', async () => {
        const axiosError = Object.assign(new Error('unauthorized'), {
            response: { status: 401 }
        });
        axiosPostMock.mockRejectedValue(axiosError);
        isAxiosErrorMock.mockReturnValue(true);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();

        const result = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            'task',
            'python',
            'code',
            [],
            userId
        );

        expect(result.feedback).toBeNull();
        expect(JSON.stringify(result)).not.toContain(apiKey);
        errorSpy.mockRestore();
    });

    it('rejects missing required response fields', () => {
        expect(() =>
            reviewCourseTaskCodeService.parseReview(JSON.stringify({
                ...review,
                codingStandards: { readability: 'good' }
            }))
        ).toThrow('INVALID_CODE_REVIEW_RESPONSE');
    });

    it('accepts a fenced JSON response with a numeric score string and extra model fields', () => {
        const result = reviewCourseTaskCodeService.parseReview(
            `Review follows:\n\`\`\`json\n${JSON.stringify({
                ...review,
                score: '95',
                additionalComment: 'not part of the response contract'
            })}\n\`\`\``
        );

        expect(result.score).toBe(95);
        expect(result.suggestions).toEqual(review.suggestions);
    });

    it('rejects a response with an invalid score or missing required fields', () => {
        expect(() =>
            reviewCourseTaskCodeService.parseReview(JSON.stringify({
                ...review,
                score: '95/100'
            }))
        ).toThrow('INVALID_CODE_REVIEW_RESPONSE');
        expect(() =>
            reviewCourseTaskCodeService.parseReview(JSON.stringify({
                score: 70
            }))
        ).toThrow('INVALID_CODE_REVIEW_RESPONSE');
    });

    it('rejects valid-looking JSON when the provider reports output truncation', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{
                    finish_reason: 'length',
                    message: { content: JSON.stringify(review) }
                }]
            }
        });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = await reviewCourseTaskCodeService.reviewCourseTaskCode(
            'task',
            'python',
            'print(1)',
            [],
            userId
        );

        expect(result.feedback).toBeNull();
        expect(result.error).toBe('Code review feedback is temporarily unavailable.');
        errorSpy.mockRestore();
        warnSpy.mockRestore();
    });
});
