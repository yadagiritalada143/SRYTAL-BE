import getCourseByIdService from '../../../services/contentwriter/getCourseByIdService';
import CourseModel from '../../../model/coursesModel';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';
import courseMedia from '../../../util/manageCourseMedia';

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
}));

const findByIdMock = (CourseModel as unknown as { findById: jest.Mock }).findById;
const questionFindMock =
    (TaskCodingQuestionModel as unknown as { find: jest.Mock }).find;
const getCourseMediaSignedUrlMock = courseMedia.getCourseMediaSignedUrl as unknown as jest.Mock;

const buildFindByIdChain = (course: any) => {
    findByIdMock.mockReturnValue({ populate: jest.fn().mockResolvedValue(course) });
};

describe('getCourseByIdService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        questionFindMock.mockReset().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([])
            })
        });
        getCourseMediaSignedUrlMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the course with signed thumbnail urls', async () => {
        const course = {
            _id: 'c1',
            courseName: 'React',
            thumbnail: 'courseThumb.png',
            toObject: () => ({
                _id: 'c1',
                courseName: 'React',
                thumbnail: 'courseThumb.png',
                modules: [
                    {
                        _id: 'm1',
                        moduleName: 'Intro',
                        thumbnail: 'moduleThumb.png',
                        tasks: [{ _id: 't1', taskName: 'Read', thumbnail: 'taskThumb.png' }]
                    }
                ]
            })
        };
        buildFindByIdChain(course);
        getCourseMediaSignedUrlMock.mockResolvedValue('https://signed-url/thumb');

        const result = await getCourseByIdService.getCourseById('c1');

        expect(findByIdMock).toHaveBeenCalledWith('c1');
        expect(questionFindMock).toHaveBeenCalledWith({
            taskId: { $in: ['t1'] }
        });
        expect(result).toEqual({
            success: true,
            coursedata: expect.objectContaining({
                _id: 'c1',
                thumbnailUrl: 'https://signed-url/thumb',
                modules: [
                    expect.objectContaining({
                        _id: 'm1',
                        thumbnailUrl: 'https://signed-url/thumb',
                        tasks: [expect.objectContaining({
                            _id: 't1',
                            thumbnailUrl: 'https://signed-url/thumb',
                            questions: []
                        })]
                    })
                ]
            })
        });
    });

    it('attaches persisted questions to their matching nested task', async () => {
        const course = {
            _id: 'c1',
            thumbnail: '',
            toObject: () => ({
                _id: 'c1',
                modules: [
                    {
                        _id: 'm1',
                        tasks: [
                            { _id: 't1', taskName: 'Question task' },
                            { _id: 't2', taskName: 'Another task' }
                        ]
                    }
                ]
            })
        };
        buildFindByIdChain(course);
        questionFindMock.mockReturnValue({
            sort: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                    {
                        _id: 'q1',
                        taskId: 't1',
                        question: 'Reverse a string',
                        description: 'Return the reversed string',
                        status: 'ACTIVE',
                        order: 0,
                        starterCode: [{ languageId: 'lang1', code: '' }]
                    }
                ])
            })
        });

        const result = await getCourseByIdService.getCourseById('c1');
        const tasks = result.coursedata.modules[0].tasks;

        expect(tasks[0].questions).toEqual([
            {
                questionId: 'q1',
                question: 'Reverse a string',
                description: 'Return the reversed string',
                status: 'ACTIVE',
                order: 0,
                starterCode: [{ languageId: 'lang1', code: '' }]
            }
        ]);
        expect(tasks[1].questions).toEqual([]);
    });

    it('does not query questions when there are no tasks', async () => {
        buildFindByIdChain({
            _id: 'c1',
            thumbnail: '',
            toObject: () => ({ _id: 'c1', modules: [] })
        });

        await getCourseByIdService.getCourseById('c1');

        expect(questionFindMock).not.toHaveBeenCalled();
    });

    it('returns { success: false } when the course is not found', async () => {
        buildFindByIdChain(null);

        const result = await getCourseByIdService.getCourseById('missing');

        expect(findByIdMock).toHaveBeenCalledWith('missing');
        expect(result).toEqual({ success: false });
    });

    it('returns { success: false } when the query throws', async () => {
        findByIdMock.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('Database failure')) });

        const result = await getCourseByIdService.getCourseById('c1');

        expect(result).toEqual({ success: false });
    });
});