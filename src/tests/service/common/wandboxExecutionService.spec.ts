import axios from 'axios';
import wandboxExecutionService from '../../../services/common/wandboxExecutionService';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        isAxiosError: jest.fn()
    }
}));

const axiosGetMock = axios.get as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;
const isAxiosErrorMock = axios.isAxiosError as unknown as jest.Mock;

const compilers = [
    { name: 'cpython-3.10.0', version: '3.10.0', language: 'Python' },
    { name: 'cpython-3.12.1', version: '3.12.1', language: 'Python' },
    { name: 'cpython-head', version: '3.13.0', language: 'Python' },
    { name: 'nodejs-20.11.0', version: '20.11.0', language: 'JavaScript' },
    { name: 'openjdk-jdk-22+36', version: '22', language: 'Java' },
    { name: 'nim-2.2.10', version: '2.2.10', language: 'Nim' }
];

describe('wandboxExecutionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axiosGetMock.mockResolvedValue({ data: compilers });
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                exit_code: '0',
                program_output: 'Hello\n',
                program_error: ''
            }
        });
        isAxiosErrorMock.mockImplementation(
            (error: unknown) => Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
        );
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves a stable compiler, passes source and test input, and normalizes stdout', async () => {
        const result = await wandboxExecutionService.executeCode(
            'Python',
            'print(input())',
            'Hello'
        );

        expect(result).toMatchObject({
            success: true,
            actualOutput: 'Hello\n',
            stderr: '',
            error: null,
            compileError: null,
            runtimeError: null
        });
        expect(axiosGetMock).toHaveBeenCalledWith(
            'https://wandbox.org/api/list.json',
            { timeout: 60000 }
        );
        expect(axiosPostMock).toHaveBeenCalledWith(
            'https://wandbox.org/api/compile.json',
            {
                compiler: 'cpython-3.12.1',
                code: 'print(input())',
                stdin: 'Hello',
                'compiler-option-raw': '',
                'runtime-option-raw': '',
                save: false
            },
            { timeout: 60000 }
        );
        expect(result).not.toHaveProperty('compiler');
    });

    it('runs Java Solution sources under Wandbox’s required prog entry file', async () => {
        axiosPostMock.mockResolvedValueOnce({
            data: {
                status: '0',
                compiler_error: '',
                compiler_output: '',
                program_output: 'HELLO\n',
                program_error: ''
            }
        });
        const sourceCode =
            'public class Solution { public static void main(String[] args) { System.out.println("HELLO"); } }';

        const result = await wandboxExecutionService.executeCode(
            'java',
            sourceCode,
            ''
        );

        expect(result).toMatchObject({
            success: true,
            actualOutput: 'HELLO\n',
            compileError: null,
            runtimeError: null
        });
        expect(axiosPostMock).toHaveBeenCalledWith(
            'https://wandbox.org/api/compile.json',
            {
                compiler: 'openjdk-jdk-22+36',
                code: 'public class prog { public static void main(String[] args) throws Exception { Solution.main(args); } }',
                codes: [{ file: 'Solution.java', code: sourceCode }],
                stdin: '',
                'compiler-option-raw': '',
                'runtime-option-raw': '',
                save: false
            },
            { timeout: 60000 }
        );
    });

    it('executes a per-input Main runner instead of a hardcoded Solution.main', async () => {
        const studentSource = [
            'public class Solution {',
            '  public int[] findDuplicates(int[] nums) {',
            '    java.util.Map<Integer, Integer> count = new java.util.HashMap<>();',
            '    for (int n : nums) count.put(n, count.getOrDefault(n, 0) + 1);',
            '    java.util.Set<Integer> result = new java.util.LinkedHashSet<>();',
            '    for (int n : nums) if (count.get(n) > 1) result.add(n);',
            '    return result.stream().mapToInt(Integer::intValue).toArray();',
            '  }',
            '  public static void main(String[] args) { System.out.println("[1, 2]"); }',
            '}'
        ].join('\n');
        const cases = [
            { input: '[1,1,2,2,3]', expected: '[1, 2]' },
            { input: '[1,2,3]', expected: '[]' }
        ];
        axiosPostMock.mockImplementation(async (
            _url: string,
            request: { code: string; codes: Array<{ file: string; code: string }> }
        ) => {
            const runner = request.codes.find(({ file }) => file === 'Main.java')?.code || '';
            const values = runner.match(/new int\[\]\{([^}]*)\}/)?.[1]
                .split(',')
                .map(Number) || [];
            const counts = new Map<number, number>();
            values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
            const duplicates = [...new Set(values.filter((value) => counts.get(value)! > 1))];
            return {
                data: {
                    status: '0',
                    compiler_error: '',
                    compiler_output: '',
                    program_output: `[${duplicates.join(', ')}]`,
                    program_error: ''
                }
            };
        });

        const outputs: string[] = [];
        for (const testCase of cases) {
            const values = JSON.parse(testCase.input) as number[];
            const runner = [
                'import java.util.*;',
                'public class Main {',
                '  public static void main(String[] args) {',
                `    var result = new Solution().findDuplicates(new int[]{${values.join(', ')}});`,
                '    System.out.println(java.util.Arrays.toString(result));',
                '  }',
                '}'
            ].join('\n');
            const execution = await wandboxExecutionService.executeCode(
                'java',
                studentSource,
                testCase.input,
                {
                    taskId: 'java-hardcoded-main-regression',
                    languageId: 'java',
                    languageName: 'Java',
                    testCaseId: `TC00${outputs.length + 1}`,
                    testCaseInput: testCase.input,
                    javaRunnerSource: runner,
                    javaEntryPoint: 'Main'
                }
            );
            outputs.push(execution.actualOutput);
            expect(execution.success).toBe(true);
            expect(execution.actualOutput).toBe(testCase.expected);
        }

        expect(outputs).toEqual(['[1, 2]', '[]']);
        expect(axiosPostMock).toHaveBeenCalledTimes(2);
        for (const [url, request] of axiosPostMock.mock.calls) {
            expect(url).toBe('https://wandbox.org/api/compile.json');
            expect(request.code).toContain('Main.main(args)');
            expect(request.code).not.toContain('Solution.main(args)');
            expect(request.codes).toEqual(expect.arrayContaining([
                { file: 'Solution.java', code: studentSource },
                expect.objectContaining({ file: 'Main.java' })
            ]));
            expect(request.stdin).toBe('');
        }
    });

    it('never treats a non-zero compiler status with no diagnostics as success', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '1',
                compiler_error: '',
                compiler_output: '',
                program_output: '',
                program_error: '',
                program_status: null,
                exit_code: null
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'javascript',
            'invalid source'
        );

        expect(result).toMatchObject({
            success: false,
            actualOutput: '',
            error: 'Program execution failed.',
            compileError: null,
            serviceError: null
        });
        expect(result.runtimeError).toBeTruthy();
    });

    it('treats a successful run that produces no output as success', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                program_status: '0',
                program_output: '',
                program_error: ''
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'python',
            'pass'
        );

        expect(result).toMatchObject({
            success: true,
            actualOutput: '',
            error: null,
            compileError: null,
            runtimeError: null,
            serviceError: null
        });
    });

    it('treats a zero compiler status without a program status and empty output as success', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                program_output: ''
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'python',
            'pass'
        );

        expect(result).toMatchObject({
            success: true,
            actualOutput: '',
            runtimeError: null,
            serviceError: null
        });
    });

    it('captures compiler errors in the normalized result', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                compiler_error: 'SyntaxError: invalid syntax',
                compiler_output: '',
                program_output: '',
                program_error: ''
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'javascript',
            'invalid source'
        );

        expect(result).toMatchObject({
            success: false,
            actualOutput: '',
            error: 'Compilation failed.',
            compileError: 'SyntaxError: invalid syntax',
            runtimeError: null
        });
    });

    it('classifies nonzero execution status with diagnostics as a runtime failure', async () => {
        axiosPostMock.mockResolvedValue({
            status: 200,
            statusText: 'OK',
            data: {
                status: '1',
                compiler_error: '',
                compiler_output: '',
                program_output: '',
                program_error: 'Error: runtime failure'
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'javascript',
            'invalid source'
        );

        expect(result).toMatchObject({
            success: false,
            error: 'Program execution failed.',
            compileError: null,
            runtimeError: 'Error: runtime failure',
            serviceError: null
        });
    });

    it('does not treat Nim successful-build output in compiler_error as a compilation error', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                compiler_output: '',
                compiler_error: '43378 lines; out: prog [SuccessX]',
                program_output: 'HELLO\n'
            }
        });

        const result = await wandboxExecutionService.executeCode('nim', 'echo "HELLO"');

        expect(result).toMatchObject({
            success: true,
            actualOutput: 'HELLO\n',
            compileError: null,
            runtimeError: null
        });
    });

    it('classifies compiler output on a failed compile as a compilation error', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '1',
                compiler_output: 'compiler: syntax error',
                compiler_error: '',
                program_output: '',
                program_error: ''
            }
        });

        const result = await wandboxExecutionService.executeCode('nim', 'invalid source');

        expect(result).toMatchObject({
            success: false,
            error: 'Compilation failed.',
            compileError: 'compiler: syntax error',
            runtimeError: null
        });
    });

    it('classifies syntax diagnostics as compilation failures for interpreted languages', async () => {
        axiosPostMock.mockResolvedValue({
            status: 200,
            statusText: 'OK',
            data: {
                status: '1',
                compiler_error: '',
                compiler_output: '',
                program_output: '',
                program_error: "prog.js:1 SyntaxError: Unexpected token '='"
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'javascript',
            'const = invalid'
        );

        expect(result).toMatchObject({
            success: false,
            error: 'Compilation failed.',
            compileError: "prog.js:1 SyntaxError: Unexpected token '='",
            runtimeError: null
        });
    });

    it('treats a response without compiler status as a request error', async () => {
        axiosPostMock.mockResolvedValue({
            status: 200,
            statusText: 'OK',
            data: { program_output: 'unexpected' }
        });

        const result = await wandboxExecutionService.executeCode(
            'javascript',
            'console.log("HELLO");'
        );

        expect(result).toMatchObject({
            success: false,
            error: 'Wandbox returned a response without a compiler status.',
            compileError: null,
            serviceError: 'REQUEST_ERROR'
        });
    });

    it('captures stderr and detects runtime failure', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                exit_code: '1',
                program_output: 'partial output\n',
                program_error: 'Traceback: failure'
            }
        });

        const result = await wandboxExecutionService.executeCode(
            'JavaScript',
            'throw new Error()'
        );

        expect(result).toMatchObject({
            success: false,
            actualOutput: 'partial output\n',
            stderr: 'Traceback: failure',
            error: 'Program execution failed.',
            compileError: null,
            runtimeError: 'Traceback: failure'
        });
    });

    it('reports request timeouts without leaking upstream details', async () => {
        const timeout = Object.assign(new Error('timeout of 20000ms exceeded'), {
            isAxiosError: true,
            code: 'ECONNABORTED'
        });
        axiosPostMock.mockRejectedValue(timeout);

        const result = await wandboxExecutionService.executeCode(
            'javascript',
            'while (true) {}'
        );

        expect(result).toMatchObject({
            success: false,
            actualOutput: '',
            error: 'Wandbox HTTP request timed out before an execution result was received.',
            compileError: null,
            runtimeError: 'Wandbox HTTP request timed out.',
            serviceError: 'REQUEST_ERROR'
        });
    });

    it('returns immediately on a rate limit and records the Retry-After cooldown', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-10-08T00:00:00.000Z'));
        const rateLimit = Object.assign(new Error('too many requests'), {
            isAxiosError: true,
            response: {
                status: 429,
                headers: { 'retry-after': '30' }
            }
        });
        axiosPostMock.mockRejectedValueOnce(rateLimit);

        const result = await wandboxExecutionService.executeCode(
            'python',
            'print("ok")'
        );

        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({
            success: false,
            serviceError: 'RATE_LIMITED',
            retryAfterSeconds: 30
        });
        jest.useRealTimers();
    });

    it('does not send subsequent requests during the shared rate-limit cooldown', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-10-08T00:01:00.000Z'));
        axiosPostMock.mockRejectedValueOnce(Object.assign(new Error('too many requests'), {
            isAxiosError: true,
            response: { status: 429, headers: { 'retry-after': '30' } }
        }));

        const first = await wandboxExecutionService.executeCode('python', 'print("ok")');
        const second = await wandboxExecutionService.executeCode('python', 'print("ok")');

        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(first.serviceError).toBe('RATE_LIMITED');
        expect(second).toMatchObject({
            success: false,
            serviceError: 'RATE_LIMITED',
            retryAfterSeconds: 30
        });
        jest.useRealTimers();
    });

    it('rejects unsupported and non-executable languages without calling Wandbox', async () => {
        const result = await wandboxExecutionService.executeCode(
            'Elixir',
            'IO.puts("no")'
        );

        expect(result).toMatchObject({
            success: false,
            error: 'Unsupported or invalid programming language.'
        });
        expect(axiosGetMock).not.toHaveBeenCalled();
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('returns a generic failure if Wandbox has no compiler for the selected language', async () => {
        const result = await wandboxExecutionService.executeCode(
            'Scala',
            'class Main {}'
        );

        expect(result).toMatchObject({
            success: false,
            error: 'No compatible compiler is currently available for this language.'
        });
        expect(axiosPostMock).not.toHaveBeenCalled();
    });
});
