"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllCoursesService_1 = __importDefault(require("../../../services/contentwriter/getAllCoursesService"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
}));
const findMock = coursesModel_1.default.find;
const getCourseMediaSignedUrlMock = manageCourseMedia_1.default.getCourseMediaSignedUrl;
const buildFindChain = (courses) => {
    findMock.mockReturnValue({ populate: jest.fn().mockResolvedValue(courses) });
};
describe('getAllCoursesService', () => {
    beforeEach(() => {
        findMock.mockReset();
        getCourseMediaSignedUrlMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
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
        const result = await getAllCoursesService_1.default.AllCourses();
        expect(findMock).toHaveBeenCalledTimes(1);
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('courseThumb.png');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('moduleThumb.png');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('taskThumb.png');
        expect(result.courses).toHaveLength(1);
        expect(result.courses[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.courses[0].modules[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.courses[0].modules[0].tasks[0].thumbnailUrl).toBe('https://signed-url/thumb');
        expect(result.totals).toEqual({ totalCourses: 1, totalModules: 1, totalTasks: 1 });
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
        const result = await getAllCoursesService_1.default.AllCourses();
        expect(result.courses[0].thumbnailUrl).toBe('');
        expect(result.totals).toEqual({ totalCourses: 1, totalModules: 0, totalTasks: 0 });
    });
    it('rethrows the error when the query fails', async () => {
        findMock.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('Database failure')) });
        await expect(getAllCoursesService_1.default.AllCourses()).rejects.toThrow('Database failure');
    });
});
