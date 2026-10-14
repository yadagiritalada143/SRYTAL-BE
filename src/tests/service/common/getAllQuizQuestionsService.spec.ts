import getAllQuizQuestionsService from '../../../services/contentwriter/getAllQuizQuestionsService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseQuizQuestionModel from '../../../model/courseQuizQuestionModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/courseQuizQuestionModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const questionFindMock = (CourseQuizQuestionModel as unknown as { find: jest.Mock }).find;

const mockLeanChain = (mock: jest.Mock, value: unknown) => {
    mock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const mockFindChain = (value: unknown) => {
    const sortMock = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) });
    questionFindMock.mockReturnValue({ sort: sortMock });
    return sortMock;
};

describe('getAllQuizQuestionsService', () => {
    beforeEach(() => {
        taskFindByIdMock.mockReset();
        questionFindMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns taskNotFound when the task does not exist', async () => {
        mockLeanChain(taskFindByIdMock, null);

        const result = await getAllQuizQuestionsService.getAllQuizQuestions('t1');

        expect(result).toEqual({ success: false, taskNotFound: true });
        expect(questionFindMock).not.toHaveBeenCalled();
    });

    it('returns notQuizTask when the task type is not QUIZ', async () => {
        mockLeanChain(taskFindByIdMock, { type: 'LINK' });

        const result = await getAllQuizQuestionsService.getAllQuizQuestions('t1');

        expect(result).toEqual({ success: false, notQuizTask: true });
        expect(questionFindMock).not.toHaveBeenCalled();
    });

    it('returns non-deleted questions in a stable order', async () => {
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ' });
        const questions = [
            { _id: 'q1', question: 'First?', status: 'SHOW' },
            { _id: 'q2', question: 'Second?', status: 'HIDE' }
        ];
        const sortMock = mockFindChain(questions);

        const result = await getAllQuizQuestionsService.getAllQuizQuestions('t1');

        expect(questionFindMock).toHaveBeenCalledWith({ taskId: 't1', isDeleted: false });
        expect(sortMock).toHaveBeenCalledWith({ createdAt: 1, _id: 1 });
        expect(result).toEqual({ success: true, questions });
    });

    it('returns { success: false } when the database throws', async () => {
        taskFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) })
        });

        const result = await getAllQuizQuestionsService.getAllQuizQuestions('t1');

        expect(result).toEqual({ success: false });
    });
});
