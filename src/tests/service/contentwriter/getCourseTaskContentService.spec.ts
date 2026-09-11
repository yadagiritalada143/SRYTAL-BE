import getCourseTaskContentService from '../../../services/contentwriter/getCourseTaskContentService';
import CourseTaskModel from '../../../model/courseTaskModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const findByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;

describe('getCourseTaskContentService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the task content when found', async () => {
        const task = { _id: 't1', taskName: 'Read', type: 'FILE', content: 'key' };
        findByIdMock.mockResolvedValue(task);

        const result = await getCourseTaskContentService.getCourseTaskContent('t1');

        expect(findByIdMock).toHaveBeenCalledWith('t1');
        expect(result).toEqual({ success: true, task });
    });

    it('returns { success: false } when the task is not found', async () => {
        findByIdMock.mockResolvedValue(null);

        const result = await getCourseTaskContentService.getCourseTaskContent('missing');

        expect(findByIdMock).toHaveBeenCalledWith('missing');
        expect(result).toEqual({ success: false });
    });

    it('returns { success: false } when the query throws', async () => {
        findByIdMock.mockRejectedValue(new Error('Database failure'));

        const result = await getCourseTaskContentService.getCourseTaskContent('t1');

        expect(result).toEqual({ success: false });
    });
});