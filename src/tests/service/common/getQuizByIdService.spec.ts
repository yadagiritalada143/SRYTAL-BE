import getQuizByIdService from '../../../services/common/getQuizByIdService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../../model/courseQuizQuestionModel';
import TaskProgressModel from '../../../model/taskProgressModel';
import { Types } from 'mongoose';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/courseQuizQuestionModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/taskProgressModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), findOneAndUpdate: jest.fn() }
}));

const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const courseFindByIdMock = (CourseModel as unknown as { findById: jest.Mock }).findById;
const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const questionFindMock = (CourseQuizQuestionModel as unknown as { find: jest.Mock }).find;
const taskProgressFindOneMock = (TaskProgressModel as unknown as { findOne: jest.Mock }).findOne;
const taskProgressFindOneAndUpdateMock = (TaskProgressModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;

const mockTaskChain = (value: unknown) => {
    taskFindByIdMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockModuleChain = (value: unknown) => {
    moduleFindByIdMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockCourseChain = (value: unknown) => {
    courseFindByIdMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockAssignmentChain = (value: unknown) => {
    assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(value) });
};

const mockFindQuestionsChain = (value: unknown) => {
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) });
    questionFindMock.mockReturnValue({ sort: sortMock });
    return sortMock;
};

const mockTaskProgressFindOneChain = (value: unknown) => {
    taskProgressFindOneMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

describe('getQuizByIdService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        moduleFindByIdMock.mockReset();
        courseFindByIdMock.mockReset();
        taskFindByIdMock.mockReset();
        questionFindMock.mockReset();
        taskProgressFindOneMock.mockReset();
        taskProgressFindOneAndUpdateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns invalidTaskId when taskId is missing', async () => {
        const result = await getQuizByIdService.getQuizById('', 'emp1');
        expect(result).toEqual({ success: false, invalidTaskId: true });
    });

    it('returns invalidTaskId when taskId is not a valid ObjectId', async () => {
        const result = await getQuizByIdService.getQuizById('not-valid', 'emp1');
        expect(result).toEqual({ success: false, invalidTaskId: true });
    });

    it('returns taskNotFound when task does not exist', async () => {
        mockTaskChain(null);
        const taskId = new Types.ObjectId().toString();
        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false, taskNotFound: true });
    });

    it('returns notQuizTask when task type is not QUIZ', async () => {
        mockTaskChain({ moduleId: 'm1', taskName: 'Link Task', type: 'LINK', status: 'ACTIVE' });
        const taskId = new Types.ObjectId().toString();
        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false, notQuizTask: true });
    });

    it('returns taskInactive when task is not ACTIVE', async () => {
        mockTaskChain({ moduleId: 'm1', taskName: 'Quiz', type: 'QUIZ', status: 'ARCHIVE' });
        const taskId = new Types.ObjectId().toString();
        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false, taskInactive: true });
    });

    it('returns notFound when module missing', async () => {
        mockTaskChain({ moduleId: 'm1', taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain(null);
        const taskId = new Types.ObjectId().toString();
        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false, notFound: true });
    });

    it('returns notFound when no assignment for employee', async () => {
        mockTaskChain({ moduleId: 'm1', taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(null);
        mockCourseChain({ status: 'ACTIVE' });
        const taskId = new Types.ObjectId().toString();
        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false, notFound: true });
    });

    it('returns notFound when course is archived', async () => {
        mockTaskChain({ moduleId: 'm1', taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain({ _id: 'a1' });
        mockCourseChain({ status: 'ARCHIVE' });
        const taskId = new Types.ObjectId().toString();
        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false, notFound: true });
    });

    it('fetches valid quiz and returns randomized presentation without isanswer', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const questions = [
            {
                _id: new Types.ObjectId(),
                question: 'Which HTML tag is used for JavaScript?',
                type: 'RADIO',
                options: [
                    { value: '<code>', isanswer: false },
                    { value: '<javascript>', isanswer: false },
                    { value: '<script>', isanswer: true }
                ]
            },
            {
                _id: new Types.ObjectId(),
                question: 'Provide feedback about the course.',
                type: 'TEXTAREA'
            }
        ];
        mockFindQuestionsChain(questions);

        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');

        expect(result.success).toBe(true);
        expect(result.taskId).toBe(taskId);
        expect(result.taskName).toBe('Quiz');
        expect(result.totalQuestions).toBe(2);
        expect(result.attemptId).toBeDefined();
        expect(result.questions).toBeDefined();
        expect(result.questions!.length).toBe(2);

        const radioQ = result.questions![0];
        expect(radioQ.questionId).toBeDefined();
        expect(radioQ.type).toBe('RADIO');
        expect(Array.isArray(radioQ.options)).toBe(true);
        expect(radioQ.options!.length).toBe(3);
        radioQ.options!.forEach(opt => {
            expect(Object.keys(opt)).toEqual(['optionId', 'value']);
            expect((opt as any).isanswer).toBeUndefined();
        });

        const textQ = result.questions![1];
        expect(textQ.type).toBe('TEXTAREA');
        expect(textQ.options).toBeUndefined();
    });

    it('reattempt produces new attemptId', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const questions = [
            {
                _id: new Types.ObjectId(),
                question: 'Q1',
                type: 'RADIO',
                options: [
                    { value: 'A', isanswer: true },
                    { value: 'B', isanswer: false }
                ]
            }
        ];
        mockFindQuestionsChain(questions);

        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result1 = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result1.attemptId).toBeDefined();

        mockTaskProgressFindOneChain({ quizAttempts: [{ _id: new Types.ObjectId(), attemptNumber: 1 }] });

        const result2 = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result2.attemptId).toBeDefined();
        expect(result2.attemptId).not.toBe(result1.attemptId);
    });

    it('excludes hidden and deleted questions', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        mockFindQuestionsChain([]);
        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');

        expect(questionFindMock).toHaveBeenCalledWith({ taskId, isDeleted: false, status: 'SHOW' });
        expect(result.totalQuestions).toBe(0);
        expect(result.attemptId).toBeUndefined();
    });

    it('handles TEXTAREA with no options', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const questions = [
            {
                _id: new Types.ObjectId(),
                question: 'Tell us more',
                type: 'TEXTAREA'
            }
        ];
        mockFindQuestionsChain(questions);

        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result.questions![0].type).toBe('TEXTAREA');
        expect(result.questions![0].options).toBeUndefined();
    });

    it('uses fallback optionId when option has no _id', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const questions = [
            {
                _id: new Types.ObjectId(),
                question: 'Q',
                type: 'RADIO',
                options: [
                    { value: 'A', isanswer: true },
                    { value: 'B', isanswer: false }
                ]
            }
        ];
        mockFindQuestionsChain(questions);

        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        const opts = result.questions![0].options!;
        expect(opts[0].optionId).toMatch(/^opt-(0|1)$/);
        expect(opts[1].optionId).toMatch(/^opt-(0|1)$/);
    });

    it('preserves optionId when option has _id', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const optId = new Types.ObjectId().toString();
        const questions = [
            {
                _id: new Types.ObjectId(),
                question: 'Q',
                type: 'RADIO',
                options: [
                    { _id: optId, value: 'A', isanswer: true }
                ]
            }
        ];
        mockFindQuestionsChain(questions);

        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result.questions![0].options![0].optionId).toBe(optId);
    });

    it('returns empty quiz when no questions', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        mockFindQuestionsChain([]);
        mockTaskProgressFindOneChain(null);

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');

        expect(result.success).toBe(true);
        expect(result.totalQuestions).toBe(0);
        expect(result.questions).toEqual([]);
        expect(result.attemptId).toBeUndefined();
    });

    it('returns database error shape when exception thrown', async () => {
        const taskId = new Types.ObjectId().toString();
        taskFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) })
        });

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');
        expect(result).toEqual({ success: false });
    });

    it('shuffles question order and option order without mutating stored documents', async () => {
        const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const storedQuestions = [
            {
                _id: new Types.ObjectId(),
                question: 'Q-first',
                type: 'RADIO',
                options: [
                    { value: 'A', isanswer: true },
                    { value: 'B', isanswer: false }
                ]
            },
            {
                _id: new Types.ObjectId(),
                question: 'Q-second',
                type: 'RADIO',
                options: [
                    { value: 'C', isanswer: false },
                    { value: 'D', isanswer: true }
                ]
            }
        ];
        const snapshot = JSON.parse(JSON.stringify(storedQuestions));

        mockFindQuestionsChain(storedQuestions);
        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});

        const result = await getQuizByIdService.getQuizById(taskId, 'emp1');

        // Math.random() = 0.1 always makes Fisher-Yates swap, reversing order.
        expect(result.questions![0].question).toBe('Q-second');
        expect(result.questions![1].question).toBe('Q-first');
        // Q-second holds options C,D — reversed to D,C.
        expect(result.questions![0].options![0].value).toBe('D');
        expect(result.questions![0].options![1].value).toBe('C');

        // The persisted documents are never modified by shuffling.
        expect(JSON.parse(JSON.stringify(storedQuestions))).toEqual(snapshot);

        randomSpy.mockRestore();
    });

    it('reattempt with new randomization produces a different presentation', async () => {
        const assignment = { _id: new Types.ObjectId() };
        const taskId = new Types.ObjectId().toString();
        const moduleId = new Types.ObjectId();

        mockTaskChain({ moduleId, taskName: 'Quiz', type: 'QUIZ', status: 'ACTIVE' });
        mockModuleChain({ courseId: 'c1' });
        mockAssignmentChain(assignment);
        mockCourseChain({ status: 'ACTIVE' });

        const storedQuestions = [
            {
                _id: new Types.ObjectId(),
                question: 'Q1',
                type: 'RADIO',
                options: [
                    { value: 'A', isanswer: true },
                    { value: 'B', isanswer: false }
                ]
            },
            {
                _id: new Types.ObjectId(),
                question: 'Q2',
                type: 'RADIO',
                options: [
                    { value: 'C', isanswer: false },
                    { value: 'D', isanswer: true }
                ]
            }
        ];
        mockFindQuestionsChain(storedQuestions);

        // First fetch: high random values keep original order.
        const randomSpyFirst = jest.spyOn(Math, 'random').mockReturnValue(0.99);
        mockTaskProgressFindOneChain(null);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({});
        const first = await getQuizByIdService.getQuizById(taskId, 'emp1');
        randomSpyFirst.mockRestore();

        // Reattempt: low random values reverse the order.
        const randomSpySecond = jest.spyOn(Math, 'random').mockReturnValue(0.1);
        mockTaskProgressFindOneChain({ quizAttempts: [{ _id: new Types.ObjectId(), attemptNumber: 1 }] });
        const second = await getQuizByIdService.getQuizById(taskId, 'empId');
        randomSpySecond.mockRestore();

        expect(first.attemptId).toBeDefined();
        expect(second.attemptId).toBeDefined();
        expect(second.attemptId).not.toBe(first.attemptId);
        expect(first.questions![0].question).toBe('Q1');
        expect(second.questions![0].question).toBe('Q2');
        expect(first.questions![0].options![0].value).toBe('A');
        // Q2 holds options C,D — reversed to D,C on the reattempt.
        expect(second.questions![0].options![0].value).toBe('D');
    });
});
