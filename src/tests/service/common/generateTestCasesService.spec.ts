import axios from 'axios';
import generateTestCasesService from '../../../services/common/generateTestCasesService';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';

jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn()
}));

jest.mock('../../../services/useropenrouter/getUserOpenRouterKeyService', () => ({
    __esModule: true,
    default: { getUserOpenRouterKeyService: jest.fn() }
}));

const axiosPostMock = axios.post as unknown as jest.Mock;
const axiosGetMock = axios.get as unknown as jest.Mock;
const getKeyMock = getUserOpenRouterKeyService.getUserOpenRouterKeyService as unknown as jest.Mock;

const validCases = JSON.stringify({
    testCases: [
        { name: 'empty', input: '[]', expectedOutput: '0' },
        { name: 'single', input: '[5]', expectedOutput: '5' },
        { name: 'multiple', input: '[1,9,3]', expectedOutput: '9' }
    ]
});

const contentResponse = {
    data: { choices: [{ message: { content: validCases } }] }
};

beforeEach(() => {
    axiosPostMock.mockReset();
    axiosGetMock.mockReset();
    getKeyMock.mockReset();
    getKeyMock.mockResolvedValue({ openrouterKey: 'sk-or-v1-userkey' });
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

const QUESTION = 'Given an integer array nums, return the largest number in it.';

it('generates test cases using only the key stored for the user', async () => {
    axiosPostMock.mockResolvedValue(contentResponse);

    const result = await generateTestCasesService.generateTestCases('u1', QUESTION, 'python');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ name: 'empty', input: '[]', expectedOutput: '0', isSample: false });
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock.mock.calls[0][2].headers.Authorization).toBe('Bearer sk-or-v1-userkey');
});

it('sends the question and the selected language in the prompt', async () => {
    axiosPostMock.mockResolvedValue(contentResponse);

    await generateTestCasesService.generateTestCases('u1', QUESTION, 'java');

    const sent: string = axiosPostMock.mock.calls[0][1].messages[0].content;
    expect(sent).toContain(QUESTION);
    expect(sent).toContain('java');
});

it('never lists or calls a free model when the stored key is rejected', async () => {
    axiosPostMock.mockRejectedValue({ response: { status: 401 } });

    await expect(
        generateTestCasesService.generateTestCases('u1', QUESTION, 'python')
    ).rejects.toThrow('OPENROUTER_KEY_INVALID');

    // No fallback: the model catalogue is never fetched and only one model is tried.
    expect(axiosGetMock).not.toHaveBeenCalled();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
});

it('reports an invalid key for 403 as well', async () => {
    axiosPostMock.mockRejectedValue({ response: { status: 403 } });

    await expect(
        generateTestCasesService.generateTestCases('u1', QUESTION, 'python')
    ).rejects.toThrow('OPENROUTER_KEY_INVALID');
    expect(axiosGetMock).not.toHaveBeenCalled();
});

it('reports insufficient credits distinctly from an invalid key, with no fallback', async () => {
    axiosPostMock.mockRejectedValue({ response: { status: 402 } });

    await expect(
        generateTestCasesService.generateTestCases('u1', QUESTION, 'python')
    ).rejects.toThrow('OPENROUTER_INSUFFICIENT_CREDITS');

    expect(axiosGetMock).not.toHaveBeenCalled();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
});

it('does not fall back when the stored key is missing', async () => {
    getKeyMock.mockRejectedValue(new Error('USER_OPENROUTER_KEY_NOT_FOUND'));

    await expect(
        generateTestCasesService.generateTestCases('u1', QUESTION, 'python')
    ).rejects.toThrow('USER_OPENROUTER_KEY_NOT_FOUND');

    expect(axiosPostMock).not.toHaveBeenCalled();
    expect(axiosGetMock).not.toHaveBeenCalled();
});

it('fails with an explicit error when the model returns no content', async () => {
    axiosPostMock.mockResolvedValue({ data: { choices: [{ message: { content: '' } }] } });

    await expect(
        generateTestCasesService.generateTestCases('u1', QUESTION, 'python')
    ).rejects.toThrow('INVALID_GENERATED_TEST_CASES');
    expect(axiosGetMock).not.toHaveBeenCalled();
});

it('fails when the response holds no usable test cases', async () => {
    axiosPostMock.mockResolvedValue({ data: { choices: [{ message: { content: 'not json at all' } }] } });

    await expect(
        generateTestCasesService.generateTestCases('u1', QUESTION, 'python')
    ).rejects.toThrow('INVALID_GENERATED_TEST_CASES');
});

it('excludes reasoning so the token budget is spent on the JSON', async () => {
    axiosPostMock.mockResolvedValue(contentResponse);

    await generateTestCasesService.generateTestCases('u1', QUESTION, 'python');

    const payload = axiosPostMock.mock.calls[0][1];
    expect(payload.reasoning).toEqual({ exclude: true });
    expect(payload.response_format).toEqual({ type: 'json_object' });
    expect(payload.max_tokens).toBeGreaterThanOrEqual(4000);
});