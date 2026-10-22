import updateQuizQuestionService from '../../../services/contentwriter/updateQuizQuestionService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';
import CourseQuizQuestionModel from '../../../model/courseQuizQuestionModel';
import { COURSE_QUIZ_QUESTION_ERROR_MESSAGES } from '../../../constants/contentwriter/courseQuizQuestionMessages';

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

const mockFindOne = (mock: jest.Mock, value: unknown) => {
    mock.mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(value) });
};

const validId = '66d323456789abcdef123456';

const fourOptions = [
    { value: 'A', isanswer: true },
    { value: 'B' },
    { value: 'C' },
    { value: 'D' }
];

const twoOptions = [
    { value: 'A', isanswer: true },
    { value: 'B' }
];

describe('updateQuizQuestionService', () => {
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
        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: 'bad' });

        expect(result).toEqual({ success: false, invalidQuestionId: true });
        expect(findOneMock).not.toHaveBeenCalled();
    });

    it('returns questionNotFound when the question does not exist', async () => {
        mockFindOne(findOneMock, null);

        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, question: 'New?' });

        expect(result).toEqual({ success: false, questionNotFound: true });
    });

    it('returns notQuizTask when the owning task is not a QUIZ task', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'CODE', moduleId: 'm1' });

        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, question: 'New?' });

        expect(result).toEqual({ success: false, notQuizTask: true });
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('updates the question text and options for a RADIO question', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockListingDuplicateLookup(null);
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        const updated = { _id: validId, question: 'New?', type: 'RADIO', options: fourOptions };
        findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) });

        const result = await updateQuizQuestionService.updateQuizQuestion({
            questionId: validId,
            question: 'New?',
            options: fourOptions
        });

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            validId,
            {
                question: 'New?',
                type: 'RADIO',
                status: undefined,
                options: [
                    { value: 'A', isanswer: true },
                    { value: 'B' },
                    { value: 'C' },
                    { value: 'D' }
                ]
            },
            { new: true }
        );
        expect(result).toEqual({ success: true, question: updated });
    });

    it('clears options when the type changes to TEXTAREA', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: validId }) });

        await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, type: 'TEXTAREA' });

        const payload = findByIdAndUpdateMock.mock.calls[0][1];
        expect(payload.type).toBe('TEXTAREA');
        expect(payload.options).toBeUndefined();
        expect(findOneMock).toHaveBeenCalledTimes(1);
    });

    it('requires options when changing from TEXTAREA to an option-based type', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'TEXTAREA' });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });

        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, type: 'RADIO' });

        expect(result.success).toBe(false);
        expect(result.invalidOptions).toBe(true);
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('rejects a RADIO update with more than one correct answer', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });

        const result = await updateQuizQuestionService.updateQuizQuestion({
            questionId: validId,
            options: [
                { value: 'A', isanswer: true },
                { value: 'B', isanswer: true },
                { value: 'C' },
                { value: 'D' }
            ]
        });

        expect(result.success).toBe(false);
        expect(result.invalidOptions).toBe(true);
    });

    it('accepts a RADIO update with exactly two options', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: twoOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: validId }) });

        const result = await updateQuizQuestionService.updateQuizQuestion({
            questionId: validId,
            options: twoOptions
        });

        expect(result.success).toBe(true);
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            validId,
            {
                question: 'Old?',
                type: 'RADIO',
                status: undefined,
                options: [{ value: 'A', isanswer: true }, { value: 'B' }]
            },
            { new: true }
        );
    });

    it('rejects an update with fewer than two options', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });

        const result = await updateQuizQuestionService.updateQuizQuestion({
            questionId: validId,
            options: [{ value: 'A', isanswer: true }]
        });

        expect(result.success).toBe(false);
        expect(result.invalidOptions).toBe(true);
        expect(result.message).toBe(COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_MIN_OPTIONS_MESSAGE);
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('rejects a TOGGLE update that does not have exactly two options', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'TOGGLE', options: twoOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });

        const result = await updateQuizQuestionService.updateQuizQuestion({
            questionId: validId,
            options: [
                { value: 'A', isanswer: true },
                { value: 'B' },
                { value: 'C' }
            ]
        });

        expect(result.success).toBe(false);
        expect(result.invalidOptions).toBe(true);
        expect(result.message).toBe(COURSE_QUIZ_QUESTION_ERROR_MESSAGES.COURSE_QUIZ_QUESTION_TOGGLE_OPTIONS_MESSAGE);
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('accepts a TOGGLE update with exactly two options', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'TOGGLE', options: twoOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: validId }) });

        const result = await updateQuizQuestionService.updateQuizQuestion({
            questionId: validId,
            options: twoOptions
        });

        expect(result.success).toBe(true);
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            validId,
            {
                question: 'Old?',
                type: 'TOGGLE',
                status: undefined,
                options: [{ value: 'A', isanswer: true }, { value: 'B' }]
            },
            { new: true }
        );
    });

    it('rejects changing the question text to a duplicate in the same task', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockFindOne(findOneMock, { _id: 'other' });

        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, question: 'Taken?' });

        expect(result).toEqual({ success: false, duplicateQuestion: true });
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    it('updates the status when supplied', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions, status: 'SHOW' });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });
        mockLeanChain(moduleFindByIdMock, { courseId: 'c1' });
        findByIdAndUpdateMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: validId }) });

        await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, status: 'HIDE' });

        const payload = findByIdAndUpdateMock.mock.calls[0][1];
        expect(payload.status).toBe('HIDE');
    });

    it('returns invalidStatus for an unsupported status', async () => {
        mockFindOne(findOneMock, { _id: validId, taskId: 't1', question: 'Old?', type: 'RADIO', options: fourOptions });
        mockLeanChain(taskFindByIdMock, { type: 'QUIZ', moduleId: 'm1' });

        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, status: 'NOPE' });

        expect(result).toEqual({ success: false, invalidStatus: true });
    });

    it('returns { success: false } when the database throws', async () => {
        findOneMock.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db')) });

        const result = await updateQuizQuestionService.updateQuizQuestion({ questionId: validId, question: 'New?' });

        expect(result).toEqual({ success: false });
    });
});

function mockListingDuplicateLookup(value: unknown) {
    mockFindOne(findOneMock, value);
}
