import createQuizQuestionService from '../../../services/contentwriter/createQuizQuestionService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';
import CourseQuizQuestionModel from '../../../model/courseQuizQuestionModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

jest.mock('../../../model/courseQuizQuestionModel', () => ({
    __esModule: true,
    default: { create: jest.fn(), findOne: jest.fn() }
}));

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const courseFindByIdAndUpdateMock = (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;
const createMock = (CourseQuizQuestionModel as unknown as { create: jest.Mock }).create;
const findOneMock = (CourseQuizQuestionModel as unknown as { findOne: jest.Mock }).findOne;

const mockDuplicateLookup = (found: unknown) => {
    findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(found) });
};

const mockLeanChain = (mock: jest.Mock, value: unknown) => {
    mock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

describe('createQuizQuestionService', () => {
    beforeEach(() => {
        taskFindByIdMock.mockReset();
        moduleFindByIdMock.mockReset();
        courseFindByIdAndUpdateMock.mockReset().mockResolvedValue({});
        createMock.mockReset();
        findOneMock.mockReset().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns taskNotFound when the task does not exist', async () => {
        mockLeanChain(taskFindByIdMock, null);

        const result = await createQuizQuestionService.createQuizQuestion(
            't1', 'Question?', 'RADIO', [{ value: 'A' }, { value: 'B', isanswer: true }], 'SHOW'
        );

        expect(result).toEqual({ success: false, taskNotFound: true });
        expect(createMock).not.toHaveBeenCalled();
    });

    it('returns notQuizTask when the task type is not QUIZ', async () => {
        mockLeanChain(taskFindByIdMock, { type: 'CODE', moduleId: 'm1' });

        const result = await createQuizQuestionService.createQuizQuestion(
            't1', 'Question?', 'RADIO', [{ value: 'A' }, { value: 'B', isanswer: true }], 'SHOW'
        );

        expect(result).toEqual({ success: false, notQuizTask: true });
        expect(createMock).not.toHaveBeenCalled();
    });

    it('returns duplicateQuestion when the same question text already exists in the task', async () => {
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockDuplicateLookup({ _id: 'q0', question: 'Question?' });
        createMock.mockResolvedValue({ _id: 'q1' });

        const result = await createQuizQuestionService.createQuizQuestion(
            't1', 'Question?', 'RADIO', [{ value: 'A' }, { value: 'B', isanswer: true }], 'SHOW'
        );

        expect(findOneMock).toHaveBeenCalledWith({
            taskId: 't1',
            isDeleted: false,
            question: { $regex: '^Question\\?$', $options: 'i' }
        });
        expect(createMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, duplicateQuestion: true });
    });

    it('creates a RADIO question with options and touches the parent course', async () => {
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        const created = { _id: 'q1', taskId: 't1', question: 'Question?', type: 'RADIO' };
        createMock.mockResolvedValue(created);

        const options = [{ value: 'A', isanswer: false }, { value: 'B', isanswer: true }];
        const result = await createQuizQuestionService.createQuizQuestion('t1', 'Question?', 'RADIO', options, 'SHOW');

        expect(createMock).toHaveBeenCalledWith({
            taskId: 't1',
            question: 'Question?',
            type: 'RADIO',
            options,
            status: 'SHOW',
            isDeleted: false
        });
        expect(courseFindByIdAndUpdateMock).toHaveBeenCalledWith('c1', {
            $currentDate: { updatedAt: true }
        });
        expect(result).toEqual({ success: true, question: created });
    });

    it('does not persist options for a TEXTAREA question', async () => {
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        createMock.mockResolvedValue({ _id: 'q2', type: 'TEXTAREA' });

        await createQuizQuestionService.createQuizQuestion('t1', 'Explain?', 'TEXTAREA', undefined, 'HIDE');

        const payload = createMock.mock.calls[0][0];
        expect(payload).toEqual({
            taskId: 't1',
            question: 'Explain?',
            type: 'TEXTAREA',
            status: 'HIDE',
            isDeleted: false
        });
        expect(payload.options).toBeUndefined();
    });

    it('returns { success: false } when the database throws', async () => {
        taskFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) })
        });

        const result = await createQuizQuestionService.createQuizQuestion('t1', 'Q?', 'RADIO', [], 'SHOW');

        expect(result).toEqual({ success: false });
    });
});
