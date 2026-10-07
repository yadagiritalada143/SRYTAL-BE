import getAllCoursesService from '../../../services/contentwriter/getAllCoursesService';
import CourseModel from '../../../model/coursesModel';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';
import courseMedia from '../../../util/manageCourseMedia';

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
}));

const findMock = (CourseModel as unknown as { find: jest.Mock }).find;
const questionFindMock =
    (TaskCodingQuestionModel as unknown as { find: jest.Mock }).find;
const getCourseMediaSignedUrlMock = courseMedia.getCourseMediaSignedUrl as unknown as jest.Mock;

const buildFindChain = (courses: any[]) => {
    findMock.mockReturnValue({ populate: jest.fn().mockResolvedValue(courses) });
};

describe('getAllCoursesService', () => {
    beforeEach(() => {
        findMock.mockReset();
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

    it('returns courses with thumbnails and totals', async () => {
        const courses = [
            {
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
                            tasks: [
                                { _id: 't1', taskName: 'Read', thumbnail: 'taskThumb.png' }
                            ]
                        }
                    ]
                })
            }
        ];
        buildFindChain(courses);
        getCourseMediaSignedUrlMock.mockResolvedValue('https://signed-url/thumb');

        const result = await getAllCoursesService.AllCourses();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(questionFindMock).toHaveBeenCalledWith({
            taskId: { $in: ['t1'] }
        });
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('courseThumb.png');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('moduleThumb.png');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('taskThumb.png');
        expect(result.courses).toHaveLength(1);
        expect(result.courses[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.courses[0].modules[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.courses[0].modules[0].tasks[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.courses[0].modules[0].tasks[0].questions).toEqual([]);
        expect(result.totals).toEqual({ totalCourses: 1, totalModules: 1, totalTasks: 1 });
    });

    it('attaches persisted questions to their matching nested task', async () => {
        const courses = [
            {
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
            }
        ];
        buildFindChain(courses);
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

        const result = await getAllCoursesService.AllCourses();

        expect(result.courses[0].modules[0].tasks[0].questions).toEqual([
            {
                questionId: 'q1',
                question: 'Reverse a string',
                description: 'Return the reversed string',
                status: 'ACTIVE',
                order: 0,
                starterCode: [{ languageId: 'lang1', code: '' }]
            }
        ]);
        expect(result.courses[0].modules[0].tasks[1].questions).toEqual([]);
    });

    it('does not query questions when there are no tasks', async () => {
        buildFindChain([]);

        await getAllCoursesService.AllCourses();

        expect(questionFindMock).not.toHaveBeenCalled();
    });

    it('handles courses without thumbnails or modules', async () => {
        const courses = [
            {
                _id: 'c2',
                courseName: 'Node',
                thumbnail: '',
                toObject: () => ({ _id: 'c2', courseName: 'Node', thumbnail: '', modules: [] })
            }
        ];
        buildFindChain(courses);

        const result = await getAllCoursesService.AllCourses();

        expect(result.courses[0].thumbnailUrl).toBe('');
        expect(result.totals).toEqual({ totalCourses: 1, totalModules: 0, totalTasks: 0 });
    });

    it('rethrows the error when the query fails', async () => {
        findMock.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('Database failure')) });

        await expect(getAllCoursesService.AllCourses()).rejects.toThrow('Database failure');
    });
});