import getQuestionService from '../../../services/common/getQuestionService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseAssignment from '../../../model/courseAssignmentModel';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';
import CodeRunModel from '../../../model/codeRunModel';
import generateBoilerplateService from '../../../services/common/generateBoilerplateService';

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

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), find: jest.fn() }
}));

jest.mock('../../../model/codeRunModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../services/common/generateBoilerplateService', () => ({
    __esModule: true,
    default: { getOrGenerateBoilerplate: jest.fn() }
}));

const taskFindByIdMock =
    (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock =
    (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const assignmentFindOneMock =
    (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const questionFindOneMock =
    (TaskCodingQuestionModel as unknown as { findOne: jest.Mock }).findOne;
const languageFindOneMock =
    (ProgrammingLanguages as unknown as { findOne: jest.Mock }).findOne;
const languageFindMock =
    (ProgrammingLanguages as unknown as { find: jest.Mock }).find;
const codeRunFindOneMock =
    (CodeRunModel as unknown as { findOne: jest.Mock }).findOne;
const generateBoilerplateMock =
    generateBoilerplateService.getOrGenerateBoilerplate as jest.Mock;

const buildLeanQuery = (value: unknown) => ({
    lean: jest.fn().mockResolvedValue(value)
});

const setupSuccessfulQuestionLookup = (starterCode: unknown[] = []) => {
    const taskId = '64f123456789abcdef123456';
    const questionId = '64f123456789abcdef123999';
    const languageId = '64f123456789abcdef123888';

    taskFindByIdMock.mockReturnValue(buildLeanQuery({
        _id: taskId,
        moduleId: '64f123456789abcdef123111',
        taskName: 'Reverse a string'
    }));
    moduleFindByIdMock.mockReturnValue({
        select: jest.fn().mockReturnValue(
            buildLeanQuery({ courseId: '64f123456789abcdef123222' })
        )
    });
    assignmentFindOneMock.mockReturnValue(buildLeanQuery({ _id: 'assignment' }));
    questionFindOneMock.mockReturnValue(buildLeanQuery({
        _id: questionId,
        taskId,
        question: 'Reverse a string',
        description: '',
        status: 'ACTIVE',
        starterCode
    }));
    languageFindOneMock.mockReturnValue({
        select: jest.fn().mockReturnValue(
            buildLeanQuery({
                _id: languageId,
                languageName: 'JavaScript',
                canonicalKey: 'javascript'
            })
        )
    });
    languageFindMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnValue(
            buildLeanQuery([{
                _id: languageId,
                languageName: 'JavaScript',
                canonicalKey: 'javascript',
                displayOrder: 1
            }])
        )
    });
    codeRunFindOneMock.mockReturnValue({
        sort: jest.fn().mockReturnValue(buildLeanQuery(null))
    });

    return { taskId, questionId, languageId };
};

describe('getQuestionService', () => {
    beforeEach(() => {
        taskFindByIdMock.mockReset();
        moduleFindByIdMock.mockReset();
        assignmentFindOneMock.mockReset();
        questionFindOneMock.mockReset();
        languageFindOneMock.mockReset();
        languageFindMock.mockReset();
        codeRunFindOneMock.mockReset();
        generateBoilerplateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('fetches a task question without relying on an isCoding flag', async () => {
        const languageId = '64f123456789abcdef123888';
        const { taskId, questionId } = setupSuccessfulQuestionLookup();
        generateBoilerplateMock.mockResolvedValue('function reverse(value) {}');

        const result = await getQuestionService.getQuestion(
            taskId,
            questionId,
            languageId,
            '64f123456789abcdef123333'
        );

        expect(result).toMatchObject({
            success: true,
            data: {
                taskId,
                questionId,
                question: 'Reverse a string',
                language: 'javascript',
                starterCode: 'function reverse(value) {}',
                boilerplateUnavailable: false
            }
        });
        expect(questionFindOneMock).toHaveBeenCalledWith({
            _id: questionId,
            taskId,
            status: 'ACTIVE'
        });
    });

    it('returns the question and marks boilerplate unavailable when generation fails', async () => {
        const { taskId, questionId, languageId } = setupSuccessfulQuestionLookup();
        generateBoilerplateMock.mockRejectedValue(
            new Error('USER_OPENROUTER_KEY_NOT_FOUND')
        );

        const result = await getQuestionService.getQuestion(
            taskId,
            questionId,
            languageId,
            '64f123456789abcdef123333'
        );

        expect(result).toMatchObject({
            success: true,
            data: {
                question: 'Reverse a string',
                starterCode: '',
                boilerplateUnavailable: true,
                boilerplateError: 'OPENROUTER_KEY_NOT_FOUND'
            }
        });
    });

});
