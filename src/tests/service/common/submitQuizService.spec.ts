import { Types } from 'mongoose';
import submitQuizService from '../../../services/common/submitQuizService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import TaskProgressModel from '../../../model/taskProgressModel';
import quizConfig from '../../../config/quizConfig';
import updateMyTaskProgressService from '../../../services/common/updateMyTaskProgressService';

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

jest.mock('../../../model/taskProgressModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn() }
}));

jest.mock('../../../config/quizConfig', () => ({
    __esModule: true,
    default: { getQuizPassingPercentage: jest.fn() }
}));

jest.mock('../../../services/common/updateMyTaskProgressService', () => ({
    __esModule: true,
    default: { updateMyTaskProgress: jest.fn() }
}));

const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const taskProgressFindOneMock = (TaskProgressModel as unknown as { findOne: jest.Mock }).findOne;
const taskProgressUpdateOneMock = (TaskProgressModel as unknown as { updateOne: jest.Mock }).updateOne;
const getPassingPercentageMock = quizConfig.getQuizPassingPercentage as unknown as jest.Mock;
const updateMyTaskProgressMock =
    updateMyTaskProgressService.updateMyTaskProgress as unknown as jest.Mock;

const TASK_ID = new Types.ObjectId().toString();
const ATTEMPT_ID = new Types.ObjectId().toString();
const PROGRESS_ID = new Types.ObjectId();
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

const validatedAttempt = (overrides: any = {}) => ({
    _id: ATTEMPT_ID,
    attemptNumber: 1,
    startedAt: new Date('2026-01-01T00:00:00Z'),
    validatedAt: new Date('2026-01-01T00:05:00Z'),
    totalScoredQuestions: 4,
    correctAnswers: 3,
    percentage: 75,
    passed: true,
    submittedAt: null,
    ...overrides
});

/** Wires the ownership chain through to a progress row holding one attempt. */
const setupChain = (attempt: any, rowOverrides: any = {}) => {
    mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ', status: 'ACTIVE' });
    mockModuleChain({ courseId: 'c1' });
    mockAssignmentChain({ _id: ASSIGNMENT_ID });
    mockProgressChain({ _id: PROGRESS_ID, isCompleted: false, completedAt: null, quizAttempts: [attempt], ...rowOverrides });
};

const completionSuccess = {
    success: true,
    courseStatus: 'In Progress',
    progress: { totalTasks: 2, completedTasks: 1, percentComplete: 50 },
    task: { taskId: TASK_ID, isCompleted: true, completedAt: new Date('2026-01-01T00:10:00Z') }
};

describe('submitQuizService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        moduleFindByIdMock.mockReset();
        taskFindByIdMock.mockReset();
        taskProgressFindOneMock.mockReset();
        taskProgressUpdateOneMock.mockReset();
        getPassingPercentageMock.mockReset();
        getPassingPercentageMock.mockReturnValue(60);
        updateMyTaskProgressMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('input and authorization validation', () => {
        it('returns invalidTaskId when taskId is missing', async () => {
            const result = await submitQuizService.submitQuiz('', ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, invalidTaskId: true });
        });

        it('returns invalidTaskId when taskId is not an ObjectId', async () => {
            const result = await submitQuizService.submitQuiz('nope', ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, invalidTaskId: true });
        });

        it('returns invalidAttemptId when attemptId is not an ObjectId', async () => {
            const result = await submitQuizService.submitQuiz(TASK_ID, 'nope', EMPLOYEE_ID);
            expect(result).toEqual({ success: false, invalidAttemptId: true });
        });

        it('returns taskNotFound when the task does not exist', async () => {
            mockTaskChain(null);
            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, taskNotFound: true });
        });

        it('returns notQuizTask when the task is not a QUIZ', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'LINK', status: 'ACTIVE' });
            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, notQuizTask: true });
        });

        it('returns taskInactive when the task is not ACTIVE', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ', status: 'INACTIVE' });
            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, taskInactive: true });
        });

        it('returns notFound when the parent module is missing', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ', status: 'ACTIVE' });
            mockModuleChain(null);
            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, notFound: true });
        });

        it('scopes the assignment lookup to the authenticated employee', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ', status: 'ACTIVE' });
            mockModuleChain({ courseId: 'c1' });
            mockAssignmentChain(null);

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, 'someone-else');

            expect(assignmentFindOneMock).toHaveBeenCalledWith({ courseId: 'c1', employeeId: 'someone-else' });
            expect(result).toEqual({ success: false, notFound: true });
        });

        it('returns notFound when the employee has no assignment', async () => {
            mockTaskChain({ moduleId: MODULE_ID, type: 'QUIZ', status: 'ACTIVE' });
            mockModuleChain({ courseId: 'c1' });
            mockAssignmentChain(null);
            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, notFound: true });
        });

        it('returns attemptNotFound when the attempt is not on the employee progress row', async () => {
            setupChain(validatedAttempt({ _id: new Types.ObjectId().toString() }));
            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);
            expect(result).toEqual({ success: false, attemptNotFound: true });
        });
    });

    describe('validation gate', () => {
        it('returns attemptNotValidated when the attempt was never validated', async () => {
            setupChain(validatedAttempt({ validatedAt: null, totalScoredQuestions: null, correctAnswers: null, percentage: null, passed: null }));

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toEqual({ success: false, attemptNotValidated: true });
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
            expect(updateMyTaskProgressMock).not.toHaveBeenCalled();
        });

        it('returns attemptNotValidated when the snapshot is only partially written', async () => {
            setupChain(validatedAttempt({ validatedAt: null, correctAnswers: null }));

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toEqual({ success: false, attemptNotValidated: true });
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
        });
    });

    describe('score re-derivation (score is never trusted from the client)', () => {
        it('recomputes the percentage from the stored counts instead of trusting the stored value', async () => {
            // Tempered snapshot: claims 100% but the counts say 1/4.
            setupChain(validatedAttempt({ totalScoredQuestions: 4, correctAnswers: 1, percentage: 100, passed: true }));

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result.notPassed).toBe(true);
            expect(result.percentage).toBe(25);
            expect(result.correctAnswers).toBe(1);
            expect(result.incorrectAnswers).toBe(3);
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
        });

        it('re-evaluates the passing condition against the current threshold at submit time', async () => {
            getPassingPercentageMock.mockReturnValue(80);
            setupChain(validatedAttempt({ totalScoredQuestions: 4, correctAnswers: 3, percentage: 75, passed: true }));

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result.notPassed).toBe(true);
            expect(result.percentage).toBe(75);
            expect(result.passingPercentage).toBe(80);
            expect(result.passed).toBe(false);
        });

        it('rounds the re-derived percentage to a whole number', async () => {
            setupChain(validatedAttempt({ totalScoredQuestions: 3, correctAnswers: 2, percentage: 0, passed: false }));

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result.percentage).toBe(67);
            expect(result.passed).toBe(true);
        });

        it('never returns correct answers or a review payload', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue(completionSuccess);

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect((result as any).review).toBeUndefined();
            expect(JSON.stringify(result)).not.toContain('correctOption');
        });
    });

    describe('failed attempts', () => {
        it('returns the score and reattempt requirement without finalizing or completing', async () => {
            setupChain(validatedAttempt({ totalScoredQuestions: 4, correctAnswers: 1, percentage: 25, passed: false }));

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toEqual({
                success: false,
                notPassed: true,
                taskId: TASK_ID,
                attemptId: ATTEMPT_ID,
                attemptNumber: 1,
                totalScoredQuestions: 4,
                correctAnswers: 1,
                incorrectAnswers: 3,
                percentage: 25,
                passingPercentage: 60,
                passed: false,
                reattemptRequired: true
            });
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
            expect(updateMyTaskProgressMock).not.toHaveBeenCalled();
        });
    });

    describe('successful finalization', () => {
        it('claims the attempt and completes the task for a passing score', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue(completionSuccess);

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(taskProgressUpdateOneMock).toHaveBeenCalledTimes(1);
            const [filter, update, options] = taskProgressUpdateOneMock.mock.calls[0];
            // The row is matched by _id only; the exact attempt element is
            // selected by arrayFilters so multiple attempts cannot confuse it.
            expect(filter).toEqual({ _id: PROGRESS_ID });
            expect(options).toEqual({
                arrayFilters: [{ 'attempt._id': ATTEMPT_ID, 'attempt.submittedAt': null }]
            });
            expect(Object.keys(update.$set)).toEqual(['quizAttempts.$[attempt].submittedAt']);
            expect(update.$set['quizAttempts.$[attempt].submittedAt']).toBeInstanceOf(Date);

            expect(updateMyTaskProgressMock).toHaveBeenCalledWith(String(ASSIGNMENT_ID), TASK_ID, true, EMPLOYEE_ID);

            expect(result).toEqual({
                success: true,
                taskId: TASK_ID,
                attemptId: ATTEMPT_ID,
                attemptNumber: 1,
                totalScoredQuestions: 4,
                correctAnswers: 3,
                incorrectAnswers: 1,
                percentage: 75,
                passingPercentage: 60,
                passed: true,
                reattemptRequired: false,
                courseStatus: 'In Progress',
                progress: completionSuccess.progress,
                isCompleted: true,
                completedAt: completionSuccess.task.completedAt
            });
        });

        it('finalizes an unscored quiz (no scored questions) as passed=null', async () => {
            setupChain(validatedAttempt({ totalScoredQuestions: 0, correctAnswers: 0, percentage: null, passed: null }));
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue(completionSuccess);

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result.success).toBe(true);
            expect(result.percentage).toBeNull();
            expect(result.passed).toBeNull();
            expect(taskProgressUpdateOneMock).toHaveBeenCalledTimes(1);
            expect(updateMyTaskProgressMock).toHaveBeenCalledTimes(1);
        });

        it('marks the task completed only after a valid passing submission', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue(completionSuccess);

            await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            // The completion routine is what writes isCompleted/completedAt; the
            // claim only stamps the attempt so the two cannot disagree.
            expect(updateMyTaskProgressMock).toHaveBeenCalledWith(
                String(ASSIGNMENT_ID),
                TASK_ID,
                true,
                EMPLOYEE_ID
            );
        });

        it('reports a generic failure when the completion routine fails after claiming', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue({ success: false, notFound: true });

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toEqual({ success: false });
        });
    });

    describe('idempotency and duplicate submissions', () => {
        it('returns an idempotent success for an already-finalized attempt without touching state', async () => {
            setupChain(
                validatedAttempt({ submittedAt: new Date('2026-01-01T00:20:00Z') }),
                { isCompleted: true, completedAt: new Date('2026-01-01T00:10:00Z') }
            );

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toMatchObject({
                success: true,
                alreadySubmitted: true,
                taskId: TASK_ID,
                attemptId: ATTEMPT_ID,
                percentage: 75,
                passed: true,
                isCompleted: true
            });
            expect(taskProgressUpdateOneMock).not.toHaveBeenCalled();
            expect(updateMyTaskProgressMock).not.toHaveBeenCalled();
        });

        it('treats a lost finalization race as an idempotent success without re-completing', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 0 });

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toMatchObject({ success: true, alreadySubmitted: true });
            expect(updateMyTaskProgressMock).not.toHaveBeenCalled();
        });

        it('only ever touches the single (assignment, module, task) progress row', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue(completionSuccess);

            await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            const [filter, , options] = taskProgressUpdateOneMock.mock.calls[0];
            expect(filter).toEqual({ _id: PROGRESS_ID });
            expect(options.arrayFilters).toEqual([
                { 'attempt._id': ATTEMPT_ID, 'attempt.submittedAt': null }
            ]);
        });

        it('does not rewrite the attempt history when finalizing', async () => {
            setupChain(validatedAttempt());
            taskProgressUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
            updateMyTaskProgressMock.mockResolvedValue(completionSuccess);

            await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            const [, update] = taskProgressUpdateOneMock.mock.calls[0];
            expect(JSON.stringify(update)).not.toContain('quizAttempts.0');
            expect(JSON.stringify(update)).not.toContain('$push');
        });
    });

    describe('error handling', () => {
        it('returns { success: false } when the database throws', async () => {
            taskFindByIdMock.mockReturnValue({
                select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) })
            });

            const result = await submitQuizService.submitQuiz(TASK_ID, ATTEMPT_ID, EMPLOYEE_ID);

            expect(result).toEqual({ success: false });
        });
    });
});
