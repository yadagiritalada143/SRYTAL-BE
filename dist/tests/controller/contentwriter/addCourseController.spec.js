"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseController_1 = __importDefault(require("../../../controllers/contentwriter/addCourseController"));
const addCourseService_1 = __importDefault(require("../../../services/contentwriter/addCourseService"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const courseMessages_1 = require("../../../constants/contentwriter/courseMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
const awsS3Config_1 = require("../../../config/awsS3Config");
jest.mock('../../../services/contentwriter/addCourseService', () => ({
    __esModule: true,
    default: { addCourse: jest.fn() }
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: {
        uploadThumbnailToS3: jest.fn(),
        getCourseMediaFromS3: jest.fn(),
        getCourseMediaSignedUrl: jest.fn()
    }
}));
const addCourseMock = addCourseService_1.default.addCourse;
const uploadThumbnailToS3Mock = manageCourseMedia_1.default.uploadThumbnailToS3;
describe('addCourseController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addCourseMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 201 when the course is added without a thumbnail', async () => {
        const req = { body: { courseName: 'React', courseDescription: 'Frontend' } };
        addCourseMock.mockResolvedValue({ _id: 'c1' });
        await addCourseController_1.default.addNewCourse(req, res);
        expect(addCourseMock).toHaveBeenCalledWith('React', 'Frontend', '', 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: courseMessages_1.COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
    });
    it('uploads the thumbnail and returns 201 with the generated key', async () => {
        const req = {
            body: { courseName: 'React', courseDescription: 'Frontend' },
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        };
        addCourseMock.mockResolvedValue({ _id: 'c1' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'thumb-key' });
        await addCourseController_1.default.addNewCourse(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'image/png', awsS3Config_1.coursesThumbnailsFolder);
        expect(addCourseMock).toHaveBeenCalledWith('React', 'Frontend', 'thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: courseMessages_1.COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
    });
    it('returns 500 when the service throws', async () => {
        const req = { body: { courseName: 'React', courseDescription: 'Frontend' } };
        addCourseMock.mockRejectedValue(new Error('Service failure'));
        await addCourseController_1.default.addNewCourse(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE
        });
    });
});
