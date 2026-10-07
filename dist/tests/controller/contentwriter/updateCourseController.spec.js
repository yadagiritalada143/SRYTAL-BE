"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseController_1 = __importDefault(require("../../../controllers/contentwriter/updateCourseController"));
const updateCourseService_1 = __importDefault(require("../../../services/contentwriter/updateCourseService"));
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../../util/validateCourseStatusTypesUtil"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const courseMessages_1 = require("../../../constants/contentwriter/courseMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/contentwriter/updateCourseService', () => ({
    __esModule: true,
    default: { updateCourse: jest.fn() }
}));
jest.mock('../../../util/validateCourseStatusTypesUtil', () => ({
    __esModule: true,
    default: jest.fn()
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: {
        uploadThumbnailToS3: jest.fn(),
        getCourseMediaFromS3: jest.fn(),
        getCourseMediaSignedUrl: jest.fn()
    }
}));
const updateCourseMock = updateCourseService_1.default.updateCourse;
const isValidStatusMock = validateCourseStatusTypesUtil_1.default;
const uploadThumbnailToS3Mock = manageCourseMedia_1.default.uploadThumbnailToS3;
describe('updateCourseController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateCourseMock.mockReset();
        isValidStatusMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ id: 'c1', courseName: 'React', courseDescription: 'Frontend', status: 'active' }, overrides.body),
        file: overrides.file
    });
    it('returns 400 when the status is invalid', async () => {
        isValidStatusMock.mockReturnValue(false);
        const req = buildReq();
        await updateCourseController_1.default.updateCourse(req, res);
        expect(updateCourseMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_INVALID_STATUS_MESSAGE
        });
    });
    it('updates the course without a thumbnail and returns 200', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        const updateResponse = { success: true, responseAfterUpdateCourse: { modifiedCount: 1 } };
        updateCourseMock.mockResolvedValue(updateResponse);
        await updateCourseController_1.default.updateCourse(req, res);
        expect(updateCourseMock).toHaveBeenCalledWith('c1', 'React', 'Frontend', undefined, 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('uploads a new thumbnail and passes its key to the service', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        });
        const updateResponse = { success: true, responseAfterUpdateCourse: { modifiedCount: 1 } };
        updateCourseMock.mockResolvedValue(updateResponse);
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'new-thumb-key' });
        await updateCourseController_1.default.updateCourse(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'image/png', 'LMSData/Courses/CourseThumbnails');
        expect(updateCourseMock).toHaveBeenCalledWith('c1', 'React', 'Frontend', 'new-thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('stops early when the thumbnail upload fails', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        });
        uploadThumbnailToS3Mock.mockRejectedValue(new Error('S3 down'));
        const failedRes = {
            status: mockStatus,
            json: mockJson,
            headersSent: true
        };
        await updateCourseController_1.default.updateCourse(req, failedRes);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE
        });
        expect(updateCourseMock).not.toHaveBeenCalled();
    });
    it('returns 500 when the service throws', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        updateCourseMock.mockRejectedValue(new Error('Service failure'));
        await updateCourseController_1.default.updateCourse(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE
        });
    });
});
