import runCodeService from '../../../services/common/runCodeService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CodingQuestionTestCaseModel from '../../../model/codingQuestionTestCaseModel';
import CodeRunModel from '../../../model/codeRunModel';
import getProgrammingLanguageByIdService from '../../../services/common/getProgrammingLanguageByIdService';
import executeCodeService from '../../../services/common/executeCodeService';
import evaluateTestCasesService from '../../../services/common/evaluateTestCasesService';
import codeQualityAnalysisService from '../../../services/common/codeQualityAnalysisService';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../model/codingQuestionTestCaseModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../model/codeRunModel', () => ({
    __esModule: true,
    default: { create: jest.fn() }
}));

jest.mock('../../../services/common/getProgrammingLanguageByIdService', () => ({
    __esModule: true,
    default: { getProgrammingLanguageById: jest.fn() }
}));

jest.mock('../../../services/common/executeCodeService', () => ({
    __esModule: true,
    default: { executeCode: jest.fn() }
}));

jest.mock('../../../services/common/evaluateTestCasesService', () => ({
    __esModule: true,
    default: { evaluateTestCase: jest.fn(), summarizeResults: jest.fn() }
}));

jest.mock('../../../services/common/codeQualityAnalysisService', () => ({
    __esModule: true,
    default: { analyzeCodeQuality: jest.fn() }
}));

jest.mock('../../../services/common/generateTestCasesService', () => ({
    __esModule: true,
    MIN_TEST_CASE_COUNT: 3,
    default: { generateTestCases: jest.fn() }
}));

const courseTaskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const courseModuleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const courseAssignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneMock = (CodingQuestionTestCaseModel as unknown as { findOne: jest.Mock }).findOne;
const codeRunCreateMock = (CodeRunModel as unknown as { create: jest.Mock }).create;
const getProgrammingLanguageMock = getProgrammingLanguageByIdService.getProgrammingLanguageById as unknown as jest.Mock;
const executeCodeMock = executeCodeService.executeCode as unknown as jest.Mock;
const evaluateTestCaseMock = evaluateTestCasesService.evaluateTestCase as unknown as jest.Mock;
const summarizeResultsMock = evaluateTestCasesService.summarizeResults as unknown as jest.Mock;
const analyzeCodeQualityMock = codeQualityAnalysisService.analyzeCodeQuality as unknown as jest.Mock;

const questionId = '66d323456789abcdef123456';
const moduleId = '66d323456789abcdef123457';
const courseId = '66d323456789abcdef123458';
const languageId = '65f1a2b3c4d5e6f7890abcd1';
const employeeId = '65f1a2b3c4d5e6f7890abcd2';

const testCases = [
    { name: 'one', input: '1', expectedOutput: '1' },
    { name: 'two', input: '2', expectedOutput: '2' },
    { name: 'three', input: '3', expectedOutput: '3' }
];

const setUpValidRequest = (): void => {
    courseTaskFindByIdMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
            _id: questionId,
            moduleId,
            isCoding: true,
            question: 'Return the input.'
        })
    });
    courseModuleFindByIdMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ courseId })
    });
    courseAssignmentFindOneMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'assignment' })
    });
    testCaseFindOneMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
            status: 'COMPLETED',
            testCases
        })
    });
    getProgrammingLanguageMock.mockResolvedValue({
        _id: languageId,
        languageName: 'JavaScript'
    });
    executeCodeMock.mockResolvedValue({
        stdout: '1',
        stderr: '',
        compilationError: null,
        runtimeError: null,
        status: 'COMPLETED',
        executionTimeMs: 1
    });
    evaluateTestCaseMock.mockImplementation((testCase: any) => ({
        ...testCase,
        actualOutput: testCase.expectedOutput,
        passed: true,
        status: 'COMPLETED'
    }));
    summarizeResultsMock.mockReturnValue({ total: 3, passed: 3, failed: 0, score: 100 });
    analyzeCodeQualityMock.mockResolvedValue(null);
    codeRunCreateMock.mockResolvedValue(undefined);
};

describe('runCodeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setUpValidRequest();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('resolves the language ID and uses the normalized language name for execution', async () => {
        const response = await runCodeService.runCode(
            questionId,
            languageId,
            'console.log(1);',
            employeeId
        );

        expect(getProgrammingLanguageMock).toHaveBeenCalledWith(languageId);
        expect(executeCodeMock).toHaveBeenCalledTimes(3);
        expect(executeCodeMock).toHaveBeenCalledWith({
            language: 'javascript',
            code: 'console.log(1);',
            input: '1'
        });
        expect(codeRunCreateMock).toHaveBeenCalledWith(expect.objectContaining({
            languageId
        }));
        expect(response.executionResult?.language).toBe('javascript');
    });

    it('rejects a language name instead of passing it to the executor', async () => {
        const response = await runCodeService.runCode(
            questionId,
            'javascript',
            'console.log(1);',
            employeeId
        );

        expect(response).toEqual({ success: false, invalidLanguage: true });
        expect(getProgrammingLanguageMock).not.toHaveBeenCalled();
        expect(executeCodeMock).not.toHaveBeenCalled();
    });

    it('returns invalidLanguage when the language ID does not exist', async () => {
        getProgrammingLanguageMock.mockResolvedValue(null);

        const response = await runCodeService.runCode(
            questionId,
            languageId,
            'console.log(1);',
            employeeId
        );

        expect(response).toEqual({ success: false, invalidLanguage: true });
        expect(executeCodeMock).not.toHaveBeenCalled();
    });

    it('returns invalidLanguage when the stored language is unsupported', async () => {
        getProgrammingLanguageMock.mockResolvedValue({
            _id: languageId,
            languageName: 'Ruby'
        });

        const response = await runCodeService.runCode(
            questionId,
            languageId,
            'puts 1',
            employeeId
        );

        expect(response).toEqual({ success: false, invalidLanguage: true });
        expect(executeCodeMock).not.toHaveBeenCalled();
    });
});
