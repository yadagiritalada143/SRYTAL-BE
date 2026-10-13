import getAllActiveCoursesService from '../../../services/contentwriter/getAllActiveCoursesService';
import CourseModel from '../../../model/coursesModel';
import courseMedia from '../../../util/manageCourseMedia';

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
}));

const findMock = (CourseModel as unknown as { find: jest.Mock }).find;
const getCourseMediaSignedUrlMock = courseMedia.getCourseMediaSignedUrl as unknown as jest.Mock;

describe('getAllActiveCoursesService', () => {
    beforeEach(() => {
        findMock.mockReset();
        getCourseMediaSignedUrlMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns only active courses with thumbnail URLs and the active course count', async () => {
        const courses = [
            {
                _id: 'c1',
                courseName: 'React',
                status: 'ACTIVE',
                thumbnail: 'courseThumb.png',
                toObject: () => ({
                    _id: 'c1',
                    courseName: 'React',
                    status: 'ACTIVE',
                    thumbnail: 'courseThumb.png'
                })
            },
            {
                _id: 'c2',
                courseName: 'Node',
                status: 'ACTIVE',
                thumbnail: 'anotherThumb.png',
                toObject: () => ({
                    _id: 'c2',
                    courseName: 'Node',
                    status: 'ACTIVE',
                    thumbnail: 'anotherThumb.png'
                })
            }
        ];
        findMock.mockResolvedValue(courses);
        getCourseMediaSignedUrlMock.mockResolvedValue('https://signed-url/thumb');

        const result = await getAllActiveCoursesService.AllActiveCourses();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({ status: 'ACTIVE' });
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('courseThumb.png');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('anotherThumb.png');
        expect(result.courses).toHaveLength(2);
        expect(result.courses[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.courses[0].status).toBe('ACTIVE');
        expect(result.totalActiveCourses).toBe(2);
    });

    it('returns an empty list and zero count when there are no active courses', async () => {
        findMock.mockResolvedValue([]);

        const result = await getAllActiveCoursesService.AllActiveCourses();

        expect(result.courses).toEqual([]);
        expect(result.totalActiveCourses).toBe(0);
        expect(getCourseMediaSignedUrlMock).not.toHaveBeenCalled();
    });

    it('handles courses without thumbnails', async () => {
        const courses = [
            {
                _id: 'c2',
                courseName: 'Node',
                thumbnail: '',
                toObject: () => ({ _id: 'c2', courseName: 'Node', thumbnail: '' })
            }
        ];
        findMock.mockResolvedValue(courses);

        const result = await getAllActiveCoursesService.AllActiveCourses();

        expect(result.courses[0].thumbnailUrl).toBe('');
        expect(getCourseMediaSignedUrlMock).not.toHaveBeenCalled();
        expect(result.totalActiveCourses).toBe(1);
    });

    it('rethrows the error when the query fails', async () => {
        findMock.mockRejectedValue(new Error('Database failure'));

        await expect(getAllActiveCoursesService.AllActiveCourses()).rejects.toThrow('Database failure');
    });
});