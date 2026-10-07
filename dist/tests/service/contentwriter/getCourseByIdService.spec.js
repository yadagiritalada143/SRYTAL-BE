"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseByIdService_1 = __importDefault(require("../../../services/contentwriter/getCourseByIdService"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
}));
const findByIdMock = coursesModel_1.default.findById;
const getCourseMediaSignedUrlMock = manageCourseMedia_1.default.getCourseMediaSignedUrl;
const buildFindByIdChain = (course) => {
    findByIdMock.mockReturnValue({ populate: jest.fn().mockResolvedValue(course) });
};
describe('getCourseByIdService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        getCourseMediaSignedUrlMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
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
        const result = await getCourseByIdService_1.default.getCourseById('c1');
        expect(findByIdMock).toHaveBeenCalledWith('c1');
        expect(result).toEqual({
            success: true,
            coursedata: expect.objectContaining({
                _id: 'c1',
                thumbnailUrl: 'https://signed-url/thumb',
                modules: [
                    expect.objectContaining({
                        _id: 'm1',
                        thumbnailUrl: 'https://signed-url/thumb',
                        tasks: [expect.objectContaining({ _id: 't1', thumbnailUrl: 'https://signed-url/thumb' })]
                    })
                ]
            })
        });
    });
    it('returns { success: false } when the course is not found', async () => {
        buildFindByIdChain(null);
        const result = await getCourseByIdService_1.default.getCourseById('missing');
        expect(findByIdMock).toHaveBeenCalledWith('missing');
        expect(result).toEqual({ success: false });
    });
    it('returns { success: false } when the query throws', async () => {
        findByIdMock.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('Database failure')) });
        const result = await getCourseByIdService_1.default.getCourseById('c1');
        expect(result).toEqual({ success: false });
    });
});
