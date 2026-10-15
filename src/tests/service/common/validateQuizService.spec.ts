import validateQuizService from '../../../services/common/validateQuizService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../../model/courseQuizQuestionModel';
import TaskProgressModel from '../../../model/taskProgressModel';
import quizConfig from '../../../config/quizConfig';
import { Types } from 'mongoose';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
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
    default: { findOne: jest.fn(), updateOne: jest.fn(), findOneAndUpdate: jest.fn() }
}));

jest.mock('../../../config/quizConfig', () => ({
    __esModule: true,
    default: { getQuizPassingPercentage: jest.fn() }
}));

const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const questionFindMock = (CourseQuizQuestionModel as unknown as { find: jest.Mock }).find;
const taskProgressFindOneMock = (TaskProgressModel as unknown as { findOne: jest.Mock }).findOne;
const taskProgressUpdateOneMock = (TaskProgressModel as unknown as { updateOne: jest.Mock }).updateOne;
const taskProgressFindOneAndUpdateMock = (TaskProgressModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const getPassingPercentageMock = quizConfig.getQuizPassingPercentage as unknown as jest.Mock;

const TASK_ID = new Types.ObjectId().toString();
const EMPLOYEE_ID = 'emp1';
const MODULE_ID = new Types.ObjectId();
const ASSIGNMENT_ID = new Types.ObjectId();

const mockTaskChain = (value: unknown) => {
    taskFindByIdMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockModuleChain = (value: unknown) => {
    moduleFindByIdMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockAssignmentChain = (value: unknown) => {
    assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(value) });
};

const mockProgressChain = (value: unknown) => {
    taskProgressFindOneMock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockFindQuestionsChain = (value: unknown) => {
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) });
    questionFindMock.mockReturnValue({ sort: sortMock });
    return sortMock;
};

const radioQuestion = () => ({
    _id: new Types.ObjectId(),
    question: 'Pick one',
    type: 'RADIO',
    options: [
        { value: 'A', isanswer: true },
        { value: 'B', isanswer: false }
    ]
});

const dropdownQuestion = () => ({
    _id: new Types.ObjectId(),
    question: 'Dropdown',
    type: 'DROPDOWN',
    options: [
        { value: 'X', isanswer: false },
        { value: 'Y', isanswer: true }
    ]
});

const toggleQuestion = () => ({
    _id: new Types.ObjectId(),
    question: 'Toggle',
    type: 'TOGGLE',
    options: [
        { value: 'On', isanswer: true },
        { value: 'Off', isanswer: false }
    ]
});

const checkboxQuestion = () => ({
    _id: new Types.ObjectId(),
    question: 'Pick many',
    type: 'CHECKBOX',
    options: [
        { value: 'A', isanswer: true },
        { value: 'B', isanswer: true },
        { value: 'C', isanswer: false }
    ]
});

const textareaQuestion = () => ({
    _id: new Types.ObjectId(),
    question: 'Free text',
    type: 'TEXTAREA'
});

/**
 * Wires the standard lookup chain: task -> module -> assignment -> progress
 * row (with one unsubmitted attempt) -> questions -> updateOne success.
 */
const setupHappyPath = (
    questions: any[],
    attempt: any = { _id: new Types.ObjectId(), attemptNumber: 1, submittedAt: null }
) => {
    mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ' });
    mockModuleChain({ courseId: 'c1' });
    mockAssignmentChain({ _id: ASSIGNMENT_ID });
    mockProgressChain({ quizAttempts: [attempt] });
    mockFindQuestionsChain(questions);
    taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
};

describe('validateQuizService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        moduleFindByIdMock.mockReset();
        taskFindByIdMock.mockReset();
        questionFindMock.mockReset();
        taskProgressFindOneMock.mockReset();
        taskProgressUpdateOneMock.mockReset();
        taskProgressFindOneAndUpdateMock.mockReset();
        getPassingPercentageMock.mockReset();
        getPassingPercentageMock.mockReturnValue(60);
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('input validation', () => {
        it('returns invalidTaskId when taskId is missing', async () => {
            const result = await validateQuizService.validateQuiz('', 'a1', [], EMPLOYEE_ID);
            expect(result).toEqual({ success: false, invalidTaskId: true });
        });

        it('returns invalidTaskId when taskId is not an ObjectId', async () => {
            const result = await validateQuizService.validateQuiz('bad', 'a1', [], EMPLOYEE_ID);
            expect(result).toEqual({ success: false, invalidTaskId: true });
        });

        it('returns invalidAttemptId when attemptId is not an ObjectId', async () => {
            const result = await validateQuizService.validateQuiz(TASK_ID, 'bad', [], EMPLOYEE_ID);
            expect(result).toEqual({ success: false, invalidAttemptId: true });
        });

        it('returns invalidAnswers when answers is not an array', async () => {
            const attemptId = new Types.ObjectId().toString();
            const result = await validateQuizService.validateQuiz(
                TASK_ID,
                attemptId,
                'not-an-array' as any,
                EMPLOYEE_ID
            );
            expect(result).toEqual({ success: false, invalidAnswers: true });
        });

        it('returns taskNotFound when the task does not exist', async () => {
            mockTaskChain(null);
            const attemptId = new Types.ObjectId().toString();
            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);
            expect(result).toEqual({ success: false, taskNotFound: true });
        });

        it('returns notQuizTask when the task is not a QUIZ', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'LINK' });
            const attemptId = new Types.ObjectId().toString();
            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);
            expect(result).toEqual({ success: false, notQuizTask: true });
        });

        it('returns notFound when the employee has no assignment for the owning course', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ' });
            mockModuleChain({ courseId: 'c1' });
            mockAssignmentChain(null);
            const attemptId = new Types.ObjectId().toString();
            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);
            expect(result).toEqual({ success: false, notFound: true });
        });
    });

    describe('attempt ownership and lifecycle', () => {
        it('returns attemptNotFound when the attempt is not on the employee progress row', async () => {
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([], { _id: new Types.ObjectId(), attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, attemptNotFound: true });
            expect(questionFindMock).not.toHaveBeenCalled();
        });

        it('returns attemptAlreadyFinalized when the attempt was submitted', async () => {
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([], { _id: attemptId, attemptNumber: 1, submittedAt: new Date() });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, attemptAlreadyFinalized: true });
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
        });

        it('scopes the attempt lookup to the authenticated employee', async () => {
            const attemptId = new Types.ObjectId().toString();
            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ' });
            mockModuleChain({ courseId: 'c1' });
            // Assignment lookup carries the employeeId from the JWT.
            mockAssignmentChain(null);

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], 'someone-else');

            expect(assignmentFindOneMock).toHaveBeenCalledWith({ courseId: 'c1', employeeId: 'someone-else' });
            expect(result).toEqual({ success: false, notFound: true });
        });
    });

    describe('grading by question type', () => {
        it('scores RADIO against the single correct option', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result.success).toBe(true);
            expect(result.correctAnswers).toBe(1);
            expect(result.percentage).toBe(100);
            expect(result.passed).toBe(true);
            expect(result.review![0].isCorrect).toBe(true);
        });

        it('scores a wrong RADIO selection as incorrect', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-1'] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(0);
            expect(result.incorrectAnswers).toBe(1);
            expect(result.review![0].isCorrect).toBe(false);
        });

        it('scores DROPDOWN against the single correct option', async () => {
            const question = dropdownQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-1'] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(1);
        });

        it('scores TOGGLE against the single correct option', async () => {
            const question = toggleQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(1);
        });

        it('accepts an exact CHECKBOX set regardless of order', async () => {
            const question = checkboxQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-1', 'opt-0'] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(1);
            expect(result.review![0].isCorrect).toBe(true);
        });

        it('scores a partial CHECKBOX selection as incorrect', async () => {
            const question = checkboxQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(0);
            expect(result.review![0].isCorrect).toBe(false);
        });

        it('scores a CHECKBOX selection with an extra wrong option as incorrect', async () => {
            const question = checkboxQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0', 'opt-1', 'opt-2'] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(0);
            expect(result.review![0].isCorrect).toBe(false);
        });

        it('returns the textAnswer for TEXTAREA and excludes it from the score', async () => {
            const textarea = textareaQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([textarea], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(textarea._id), textAnswer: 'Great course.' }
            ], EMPLOYEE_ID);

            expect(result.success).toBe(true);
            expect(result.totalScoredQuestions).toBe(0);
            expect(result.correctAnswers).toBe(0);
            expect(result.review![0].isCorrect).toBeNull();
            expect(result.review![0].textAnswer).toBe('Great course.');
        });

        it('treats an omitted scored question as incorrect', async () => {
            const radio = radioQuestion();
            const dropdown = dropdownQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([radio, dropdown], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(radio._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result.totalScoredQuestions).toBe(2);
            expect(result.correctAnswers).toBe(1);
            expect(result.incorrectAnswers).toBe(1);
            expect(result.review![1].isCorrect).toBe(false);
            expect(result.review![1].selectedOptionIds).toEqual([]);
        });

        it('resolves legacy option _ids when present', async () => {
            const optionId = new Types.ObjectId().toString();
            const question = {
                _id: new Types.ObjectId(),
                question: 'Legacy options',
                type: 'RADIO',
                options: [
                    { _id: optionId, value: 'A', isanswer: true },
                    { value: 'B', isanswer: false }
                ]
            };
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: [optionId] }
            ], EMPLOYEE_ID);

            expect(result.correctAnswers).toBe(1);
            expect(result.review![0].correctOptionIds).toEqual([optionId]);
        });
    });

    describe('score calculation and passing threshold', () => {
        it('computes the percentage from scored questions only', async () => {
            const radio = radioQuestion();
            const checkbox = checkboxQuestion();
            const textarea = textareaQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([radio, checkbox, textarea], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(radio._id), selectedOptionIds: ['opt-0'] },
                { questionId: String(checkbox._id), selectedOptionIds: ['opt-2'] },
                { questionId: String(textarea._id), textAnswer: 'ok' }
            ], EMPLOYEE_ID);

            expect(result.totalScoredQuestions).toBe(2);
            expect(result.correctAnswers).toBe(1);
            expect(result.incorrectAnswers).toBe(1);
            expect(result.percentage).toBe(50);
            expect(result.passed).toBe(false);
            expect(result.passingPercentage).toBe(60);
        });

        it('rounds the percentage to a whole number', async () => {
            const questions = [radioQuestion(), radioQuestion(), radioQuestion()];
            questions[0].options[0].isanswer = true;
            questions[1].options[0].isanswer = true;
            questions[2].options[0].isanswer = true;
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath(questions, { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(questions[0]._id), selectedOptionIds: ['opt-0'] },
                { questionId: String(questions[1]._id), selectedOptionIds: ['opt-0'] },
                { questionId: String(questions[2]._id), selectedOptionIds: ['opt-1'] }
            ], EMPLOYEE_ID);

            // 2/3 = 66.67 -> 67, still below the 60 threshold? 67 >= 60 -> passed
            expect(result.percentage).toBe(67);
            expect(result.passed).toBe(true);
        });

        it('passes exactly at the configured threshold', async () => {
            const questions = [radioQuestion(), radioQuestion()];
            questions[0].options[0].isanswer = true;
            questions[1].options[0].isanswer = true;
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath(questions, { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(questions[0]._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result.percentage).toBe(50);
            expect(result.passed).toBe(false);

            getPassingPercentageMock.mockReturnValue(50);
            const retry = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(questions[0]._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(retry.percentage).toBe(50);
            expect(retry.passed).toBe(true);
        });

        it('returns an unscored result for a TEXTAREA-only quiz without dividing by zero', async () => {
            const textarea = textareaQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([textarea], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(textarea._id), textAnswer: 'hello' }
            ], EMPLOYEE_ID);

            expect(result.totalScoredQuestions).toBe(0);
            expect(result.percentage).toBeNull();
            expect(result.passed).toBeNull();
            expect(Number.isNaN(result.percentage as any)).toBe(false);
        });

        it('uses the configured passing percentage', async () => {
            getPassingPercentageMock.mockReturnValue(80);
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(getPassingPercentageMock).toHaveBeenCalled();
            expect(result.passingPercentage).toBe(80);
        });
    });

    describe('answer payload validation', () => {
        it('rejects an option id that does not belong to the question', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-99'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
        });

        it('rejects duplicate question submissions', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] },
                { questionId: String(question._id), selectedOptionIds: ['opt-1'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
        });

        it('rejects a question id that is not part of this quiz', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: new Types.ObjectId().toString(), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
        });

        it('rejects an option selection on a TEXTAREA question', async () => {
            const textarea = textareaQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([textarea], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(textarea._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
        });

        it('rejects a text answer on an option-based question', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'], textAnswer: 'sneaky' }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
        });

        it('rejects multiple selections on a single-select question', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0', 'opt-1'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
        });

        it('rejects duplicated option ids within one answer', async () => {
            const question = checkboxQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0', 'opt-0'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, invalidAnswers: true });
        });
    });

    describe('persistence and side effects', () => {
        it('persists the score snapshot on the exact attempt via a filtered positional update', async () => {
            const question = radioQuestion();
            const progressId = new Types.ObjectId();
            const attemptId = new Types.ObjectId().toString();

            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ' });
            mockModuleChain({ courseId: 'c1' });
            mockAssignmentChain({ _id: ASSIGNMENT_ID });
            mockProgressChain({ _id: progressId, quizAttempts: [{ _id: attemptId, attemptNumber: 1, submittedAt: null }] });
            mockFindQuestionsChain([question]);
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });

            await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(taskProgressUpdateOneMock).toHaveBeenCalledTimes(1);
            const [filter, update, options] = taskProgressUpdateOneMock.mock.calls[0];
            // The row is matched by _id only; the target element is selected by
            // arrayFilters so multiple attempts on the row cannot confuse it.
            expect(filter).toEqual({ _id: progressId });
            expect(options).toEqual({
                arrayFilters: [{ 'attempt._id': attemptId, 'attempt.submittedAt': null }]
            });
            expect(Object.keys(update.$set)).toContain('quizAttempts.$[attempt].validatedAt');
            expect(update.$set['quizAttempts.$[attempt].totalScoredQuestions']).toBe(1);
            expect(update.$set['quizAttempts.$[attempt].correctAnswers']).toBe(1);
            expect(update.$set['quizAttempts.$[attempt].percentage']).toBe(100);
            expect(update.$set['quizAttempts.$[attempt].passed']).toBe(true);
        });

        it('never marks the task completed from validation', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            const [, update] = taskProgressUpdateOneMock.mock.calls[0];
            const updateJson = JSON.stringify(update);
            expect(updateJson).not.toContain('isCompleted');
            expect(updateJson).not.toContain('completedAt');
            expect(taskProgressFindOneAndUpdateMock).not.toHaveBeenCalled();
        });

        it('overwrites the snapshot when revalidated before finalization', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            const first = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-1'] }
            ], EMPLOYEE_ID);
            const second = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(first.correctAnswers).toBe(0);
            expect(second.correctAnswers).toBe(1);
            expect(taskProgressUpdateOneMock).toHaveBeenCalledTimes(2);
        });

        it('returns attemptAlreadyFinalized when the attempt was submitted between read and write', async () => {
            const question = radioQuestion();
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([question], { _id: attemptId, attemptNumber: 1, submittedAt: null });
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 0 });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [
                { questionId: String(question._id), selectedOptionIds: ['opt-0'] }
            ], EMPLOYEE_ID);

            expect(result).toEqual({ success: false, attemptAlreadyFinalized: true });
        });

        it('only queries published questions of the task', async () => {
            const attemptId = new Types.ObjectId().toString();
            setupHappyPath([], { _id: attemptId, attemptNumber: 1, submittedAt: null });

            await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);

            expect(questionFindMock).toHaveBeenCalledWith({
                taskId: TASK_ID,
                isDeleted: false,
                status: 'SHOW'
            });
        });

        it('returns { success: false } when the database throws', async () => {
            const attemptId = new Types.ObjectId().toString();
            taskFindByIdMock.mockReturnValue({
                select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) })
            });

            const result = await validateQuizService.validateQuiz(TASK_ID, attemptId, [], EMPLOYEE_ID);

            expect(result).toEqual({ success: false });
        });
    });
});
