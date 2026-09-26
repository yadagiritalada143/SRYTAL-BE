"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseTaskController_1 = __importDefault(require("../../../controllers/contentwriter/updateCourseTaskController"));
const updateCourseTaskService_1 = __importDefault(require("../../../services/contentwriter/updateCourseTaskService"));
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../../util/validateCourseStatusTypesUtil"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const coursetaskMessages_1 = require("../../../constants/contentwriter/coursetaskMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/contentwriter/updateCourseTaskService', () => ({
    __esModule: true,
    default: { updateCourseTask: jest.fn() }
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
const updateCourseTaskMock = updateCourseTaskService_1.default.updateCourseTask;
const isValidStatusMock = validateCourseStatusTypesUtil_1.default;
const uploadThumbnailToS3Mock = manageCourseMedia_1.default.uploadThumbnailToS3;
const buildFile = (overrides = {}) => (Object.assign({ originalname: 'file.pdf', buffer: Buffer.from('data'), mimetype: 'application/pdf' }, overrides));
describe('updateCourseTaskController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateCourseTaskMock.mockReset();
        isValidStatusMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ id: 't1', taskName: 'Read', taskDescription: 'Read the docs', status: 'active' }, overrides.body),
        files: overrides.files
    });
    it('returns 400 when the status is invalid', async () => {
        isValidStatusMock.mockReturnValue(false);
        const req = buildReq();
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(updateCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE
        });
    });
    it('updates the task without files and returns 200', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateCourseTaskMock.mockResolvedValue(updateResponse);
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(updateCourseTaskMock).toHaveBeenCalledWith('t1', 'Read', 'Read the docs', undefined, 'ACTIVE', undefined, undefined, undefined, undefined, undefined);
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });
    it('uploads the new content when a task file is provided', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            files: { taskFile: [buildFile()] }
        });
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateCourseTaskMock.mockResolvedValue(updateResponse);
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'content-key' });
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'application/pdf', 'LMSData/Courses/CourseTaskContent');
        expect(updateCourseTaskMock).toHaveBeenCalledWith('t1', 'Read', 'Read the docs', undefined, 'ACTIVE', expect.stringContaining('LMSData/Courses/CourseTaskContent/'), 'application/pdf', 'file.pdf', undefined, undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('updates the coding task fields when a coding task is provided', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            body: {
                isCoding: 'true',
                question: 'Write a function to reverse a string.'
            }
        });
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateCourseTaskMock.mockResolvedValue(updateResponse);
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(updateCourseTaskMock).toHaveBeenCalledWith('t1', 'Read', 'Read the docs', undefined, 'ACTIVE', undefined, undefined, undefined, true, 'Write a function to reverse a string.');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 400 when a coding task has no question', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            body: {
                isCoding: 'true'
            }
        });
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(updateCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_QUESTION_MESSAGE
        });
    });
    it('returns 400 when the thumbnail type is invalid', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            files: { thumbnailFile: [buildFile({ originalname: 'thumb.gif', mimetype: 'image/gif' })] }
        });
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(updateCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_THUMBNAIL_TYPE_MESSAGE
        });
    });
    it('uploads a new thumbnail when a valid thumbnail file is provided', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            files: { thumbnailFile: [buildFile({ originalname: 'thumb.png', mimetype: 'image/png' })] }
        });
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateCourseTaskMock.mockResolvedValue(updateResponse);
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'thumb-key' });
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'image/png', 'LMSData/Courses/CourseTaskThumbnails');
        expect(updateCourseTaskMock).toHaveBeenCalledWith('t1', 'Read', 'Read the docs', expect.stringContaining('LMSData/Courses/CourseTaskThumbnails/'), 'ACTIVE', undefined, undefined, undefined, undefined, undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 when the service throws', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        updateCourseTaskMock.mockRejectedValue(new Error('Service failure'));
        await updateCourseTaskController_1.default.updateCourseTask(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE
        });
    });
});
