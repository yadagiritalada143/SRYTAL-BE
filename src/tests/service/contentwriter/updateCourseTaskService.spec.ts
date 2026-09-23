import updateCourseTaskService from '../../../services/contentwriter/updateCourseTaskService';
import CourseTaskModel from '../../../model/courseTaskModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn(), findByIdAndUpdate: jest.fn() }
}));

const findByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const findByIdAndUpdateMock = (CourseTaskModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

describe('updateCourseTaskService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        findByIdAndUpdateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns { success: false } when the task does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        const result = await updateCourseTaskService.updateCourseTask('t1', 'Read', 'Description');

        expect(findByIdMock).toHaveBeenCalledWith('t1');
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });

    it('updates the task with a new thumbnail and content', async () => {
        findByIdMock.mockResolvedValue({
            _id: 't1',
            thumbnail: 'oldThumb.png',
            content: 'oldContent'
        });
        const updatedTask = { _id: 't1', taskName: 'Read', thumbnail: 'newThumb.png', content: 'newContent' };
        findByIdAndUpdateMock.mockResolvedValue(updatedTask);

        const result = await updateCourseTaskService.updateCourseTask(
            't1',
            'Read',
            'Description',
            'newThumb.png',
            'ACTIVE',
            'newContent',
            'text/plain',
            'notes.txt'
        );

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            't1',
            {
                $set: {
                    taskName: 'Read',
                    taskDescription: 'Description',
                    status: 'ACTIVE',
                    thumbnail: 'newThumb.png',
                    content: 'newContent',
                    contentMimeType: 'text/plain',
                    contentFileName: 'notes.txt'
                }
            },
            { new: true, runValidators: true }
        );
        expect(result).toEqual({ success: true, responseAfterUpdate: updatedTask });
    });

    it('updates the task without a thumbnail or new content', async () => {
        findByIdMock.mockResolvedValue({ _id: 't1', thumbnail: null, content: null });
        const updatedTask = { _id: 't1', taskName: 'Read', status: 'ARCHIVE' };
        findByIdAndUpdateMock.mockResolvedValue(updatedTask);

        const result = await updateCourseTaskService.updateCourseTask('t1', 'Read', 'Description', undefined, 'ARCHIVE');

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            't1',
            { $set: { taskName: 'Read', taskDescription: 'Description', status: 'ARCHIVE' } },
            { new: true, runValidators: true }
        );
        expect(result).toEqual({ success: true, responseAfterUpdate: updatedTask });
    });

    it('updates the coding task fields when provided', async () => {
        findByIdMock.mockResolvedValue({ _id: 't1', thumbnail: null, content: null });
        const updatedTask = { _id: 't1', taskName: 'Read', status: 'ACTIVE', isCoding: true, question: 'Reverse a string.', allowedLanguages: ['JavaScript', 'Python'] };
        findByIdAndUpdateMock.mockResolvedValue(updatedTask);

        const result = await updateCourseTaskService.updateCourseTask(
            't1',
            'Read',
            'Description',
            undefined,
            'ACTIVE',
            undefined,
            undefined,
            undefined,
            true,
            'Reverse a string.',
            ['JavaScript', 'Python']
        );

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            't1',
            {
                $set: {
                    taskName: 'Read',
                    taskDescription: 'Description',
                    status: 'ACTIVE',
                    isCoding: true,
                    question: 'Reverse a string.',
                    allowedLanguages: ['JavaScript', 'Python']
                }
            },
            { new: true, runValidators: true }
        );
        expect(result).toEqual({ success: true, responseAfterUpdate: updatedTask });
    });

    it('does not touch coding fields when not provided', async () => {
        findByIdMock.mockResolvedValue({ _id: 't1', thumbnail: null, content: null, isCoding: true, question: 'old question' });
        const updatedTask = { _id: 't1', taskName: 'Read', status: 'ARCHIVE' };
        findByIdAndUpdateMock.mockResolvedValue(updatedTask);

        const result = await updateCourseTaskService.updateCourseTask('t1', 'Read', 'Description', undefined, 'ARCHIVE');

        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            't1',
            { $set: { taskName: 'Read', taskDescription: 'Description', status: 'ARCHIVE' } },
            { new: true, runValidators: true }
        );
        expect(result).toEqual({ success: true, responseAfterUpdate: updatedTask });
    });

    it('returns { success: false } when the findByIdAndUpdate returns null', async () => {
        findByIdMock.mockResolvedValue({ _id: 't1', thumbnail: null, content: null });
        findByIdAndUpdateMock.mockResolvedValue(null);

        const result = await updateCourseTaskService.updateCourseTask('t1', 'Read', 'Description');

        expect(result).toEqual({ success: false });
    });

    it('returns { success: false } when the update throws', async () => {
        findByIdMock.mockResolvedValue({ _id: 't1', thumbnail: null, content: null });
        findByIdAndUpdateMock.mockRejectedValue(new Error('Database failure'));

        const result = await updateCourseTaskService.updateCourseTask('t1', 'Read', 'Description');

        expect(result).toEqual({ success: false, responseAfterUpdate: expect.any(Error) });
    });
});