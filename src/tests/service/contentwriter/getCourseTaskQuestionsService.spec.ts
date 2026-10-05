import getCourseTaskQuestionsService from '../../../services/contentwriter/getCourseTaskQuestionsService';
import CourseTaskModel from '../../../model/courseTaskModel';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const taskFindByIdMock =
    (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const questionFindMock =
    (TaskCodingQuestionModel as unknown as { find: jest.Mock }).find;

const buildTaskQuery = (task: unknown) => {
    taskFindByIdMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(task)
    });
};

const buildQuestionQuery = (questions: unknown[]) => {
    questionFindMock.mockReturnValue({
        sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(questions)
        })
    });
};

describe('getCourseTaskQuestionsService', () => {
    beforeEach(() => {
        taskFindByIdMock.mockReset();
        questionFindMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('fetches and returns questions stored separately from the task', async () => {
        buildTaskQuery({
            _id: '64f123456789abcdef123456',
            taskName: 'Coding task',
            isCoding: true
        });
        buildQuestionQuery([
            {
                _id: '64f123456789abcdef123999',
                taskId: '64f123456789abcdef123456',
                question: 'Reverse a string',
                description: 'Return it reversed',
                status: 'ACTIVE',
                order: 0,
                starterCode: [{ languageId: 'lang1', code: '' }]
            },
            {
                _id: '64f123456789abcdef123998',
                taskId: '64f123456789abcdef123456',
                question: 'Archived question',
                status: 'INACTIVE',
                order: 1
            }
        ]);

        const result =
            await getCourseTaskQuestionsService.getCourseTaskQuestions(
                '64f123456789abcdef123456'
            );

        expect(questionFindMock).toHaveBeenCalledWith({
            taskId: '64f123456789abcdef123456'
        });
        expect(result).toMatchObject({
            success: true,
            taskId: '64f123456789abcdef123456',
            taskName: 'Coding task',
            isCoding: true,
            questionCount: 2,
            activeQuestionCount: 1,
            questions: [
                {
                    questionId: '64f123456789abcdef123999',
                    question: 'Reverse a string',
                    description: 'Return it reversed',
                    status: 'ACTIVE',
                    order: 0,
                    starterCode: [{ languageId: 'lang1', code: '' }]
                },
                {
                    questionId: '64f123456789abcdef123998',
                    question: 'Archived question',
                    status: 'ARCHIVE',
                    order: 1,
                    starterCode: []
                }
            ]
        });
    });

    it('falls back to a legacy question when no separate questions exist', async () => {
        buildTaskQuery({
            _id: '64f123456789abcdef123456',
            taskName: 'Legacy task',
            isCoding: true,
            question: 'Legacy question',
            taskDescription: 'Legacy description'
        });
        buildQuestionQuery([]);

        const result =
            await getCourseTaskQuestionsService.getCourseTaskQuestions(
                '64f123456789abcdef123456'
            );

        expect(result.questions).toEqual([
            expect.objectContaining({
                questionId: null,
                question: 'Legacy question',
                description: 'Legacy description',
                status: 'ACTIVE'
            })
        ]);
    });

    it('does not query questions when the task does not exist', async () => {
        buildTaskQuery(null);

        const result =
            await getCourseTaskQuestionsService.getCourseTaskQuestions(
                '64f123456789abcdef123456'
            );

        expect(result).toEqual({ success: false, notFound: true });
        expect(questionFindMock).not.toHaveBeenCalled();
    });
});
