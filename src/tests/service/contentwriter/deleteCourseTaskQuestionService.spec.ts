import deleteCourseTaskQuestionService from '../../../services/contentwriter/deleteCourseTaskQuestionService';
import CourseTaskModel from '../../../model/courseTaskModel';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';
import CodingQuestionTestCaseModel from '../../../model/codingQuestionTestCaseModel';
import CodeRunModel from '../../../model/codeRunModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: { findOneAndDelete: jest.fn(), countDocuments: jest.fn() }
}));

jest.mock('../../../model/codingQuestionTestCaseModel', () => ({
    __esModule: true,
    default: { deleteMany: jest.fn() }
}));

jest.mock('../../../model/codeRunModel', () => ({
    __esModule: true,
    default: { deleteMany: jest.fn() }
}));

const findByIdMock = CourseTaskModel.findById as unknown as jest.Mock;
const findOneAndDeleteMock = TaskCodingQuestionModel.findOneAndDelete as unknown as jest.Mock;
const countDocumentsMock = TaskCodingQuestionModel.countDocuments as unknown as jest.Mock;
const testCasesDeleteManyMock = CodingQuestionTestCaseModel.deleteMany as unknown as jest.Mock;
const codeRunsDeleteManyMock = CodeRunModel.deleteMany as unknown as jest.Mock;

const TASK_ID = '652f1d3b8f00a1b2c3d4e5f6';
const QUESTION_ID = '652f1d3b8f00a1b2c3d4e5f7';

describe('deleteCourseTaskQuestionService', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const mockFindTask = (task: any) => {
        findByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(task) });
    };

    it('returns notFound when the task does not exist', async () => {
        mockFindTask(null);

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, QUESTION_ID);

        expect(result).toEqual({ success: false, notFound: true });
        expect(findOneAndDeleteMock).not.toHaveBeenCalled();
    });

    it('returns notCodingTask when the task is not a coding task', async () => {
        mockFindTask({ _id: TASK_ID, isCoding: false });

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, QUESTION_ID);

        expect(result).toEqual({ success: false, notCodingTask: true });
        expect(findOneAndDeleteMock).not.toHaveBeenCalled();
    });

    it('returns questionNotFound for an invalid question id', async () => {
        mockFindTask({ _id: TASK_ID, isCoding: true });

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, 'not-an-object-id');

        expect(result).toEqual({ success: false, questionNotFound: true });
        expect(findOneAndDeleteMock).not.toHaveBeenCalled();
    });

    it('returns questionNotFound when no question row matches the question id', async () => {
        mockFindTask({ _id: TASK_ID, isCoding: true });
        findOneAndDeleteMock.mockResolvedValue(null);

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, QUESTION_ID);

        expect(findOneAndDeleteMock).toHaveBeenCalledWith({ _id: QUESTION_ID, taskId: TASK_ID });
        expect(result).toEqual({ success: false, questionNotFound: true });
    });

    it('deletes the question row with its test cases and runs and reports the remaining count', async () => {
        mockFindTask({ _id: TASK_ID, isCoding: true });
        findOneAndDeleteMock.mockResolvedValue({ _id: QUESTION_ID, taskId: TASK_ID });
        testCasesDeleteManyMock.mockResolvedValue({});
        codeRunsDeleteManyMock.mockResolvedValue({});
        countDocumentsMock.mockResolvedValue(3);

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, QUESTION_ID);

        expect(findOneAndDeleteMock).toHaveBeenCalledWith({ _id: QUESTION_ID, taskId: TASK_ID });
        expect(testCasesDeleteManyMock).toHaveBeenCalledWith({ taskId: TASK_ID, questionId: QUESTION_ID });
        expect(codeRunsDeleteManyMock).toHaveBeenCalledWith({ taskId: TASK_ID, questionId: QUESTION_ID });
        expect(countDocumentsMock).toHaveBeenCalledWith({
            taskId: TASK_ID,
            status: { $ne: 'INACTIVE' }
        });
        expect(result).toEqual({
            success: true,
            taskId: TASK_ID,
            questionId: QUESTION_ID,
            questionCount: 3
        });
    });

    it('still succeeds when the best-effort cleanup of test cases and runs fails', async () => {
        mockFindTask({ _id: TASK_ID, isCoding: true });
        findOneAndDeleteMock.mockResolvedValue({ _id: QUESTION_ID, taskId: TASK_ID });
        testCasesDeleteManyMock.mockRejectedValue(new Error('cleanup boom'));
        codeRunsDeleteManyMock.mockResolvedValue({});
        countDocumentsMock.mockResolvedValue(0);

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, QUESTION_ID);

        expect(result.success).toBe(true);
        expect(result.questionCount).toBe(0);
        expect(console.error).toHaveBeenCalled();
    });

    it('returns success:false when the question delete throws', async () => {
        mockFindTask({ _id: TASK_ID, isCoding: true });
        findOneAndDeleteMock.mockRejectedValue(new Error('db down'));

        const result = await deleteCourseTaskQuestionService.deleteCourseTaskQuestion(TASK_ID, QUESTION_ID);

        expect(result).toEqual({ success: false });
    });
});
