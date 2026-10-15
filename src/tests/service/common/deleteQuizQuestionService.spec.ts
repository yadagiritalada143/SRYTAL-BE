import deleteQuizQuestionService from '../../../services/contentwriter/deleteQuizQuestionService';
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
    default: { findOne: jest.fn(), findByIdAndUpdate: jest.fn() }
}));

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const courseFindByIdAndUpdateMock = (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;
const findOneMock = (CourseQuizQuestionModel as unknown as { findOne: jest.Mock }).findOne;
const findByIdAndUpdateMock = (CourseQuizQuestionModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

const mockLeanChain = (mock: jest.Mock, value: unknown) => {
    mock.mockReturnValue({ select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) }) });
};

const validId = '66d323456789abcdef123456';

describe('deleteQuizQuestionService', () => {
    beforeEach(() => {
        taskFindByIdMock.mockReset();
        moduleFindByIdMock.mockReset();
        courseFindByIdAndUpdateMock.mockReset().mockResolvedValue({});
        findOneMock.mockReset();
        findByIdAndUpdateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns invalidQuestionId for a malformed id', async () => {
        const result = await deleteQuizQuestionService.deleteQuizQuestion('bad');

        expect(result).toEqual({ success: false, invalidQuestionId: true });
        expect(findOneMock).not.toHaveBeenCalled();
    });

    it('returns questionNotFound when the question does not exist', async () => {
        findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

        const result = await deleteQuizQuestionService.deleteQuizQuestion(validId);

        expect(result).toEqual({ success: false, questionNotFound: true });
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('returns notQuizTask when the owning task is not a QUIZ task', async () => {
        findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: validId, taskId: 't1' }) });
        mockLeanChain(taskFindByIdMock, { type: 'CODE', moduleId: 'm1' });

        const result = await deleteQuizQuestionService.deleteQuizQuestion(validId);

        expect(result).toEqual({ success: false, notQuizTask: true });
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('soft deletes the question and touches the parent course', async () => {
        findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: validId, taskId: 't1' }) });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        const deleted = { _id: validId, isDeleted: true };
        findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(deleted) });

        const result = await deleteQuizQuestionService.deleteQuizQuestion(validId);

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(validId, { isDeleted: true }, { new: true });
        expect(courseFindByIdAndUpdateMock).toHaveBeenCalledWith('c1', { $currentDate: { updatedAt: true } });
        expect(result).toEqual({ success: true, question: deleted });
    });

    it('returns { success: false } when the database throws', async () => {
        findOneMock.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) });

        const result = await deleteQuizQuestionService.deleteQuizQuestion(validId);

        expect(result).toEqual({ success: false });
    });
});
