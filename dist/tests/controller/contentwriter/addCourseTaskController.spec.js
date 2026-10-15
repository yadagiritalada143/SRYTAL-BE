"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseTaskController_1 = __importDefault(require("../../../controllers/contentwriter/addCourseTaskController"));
const addCourseTaskService_1 = __importDefault(require("../../../services/contentwriter/addCourseTaskService"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const coursetaskMessages_1 = require("../../../constants/contentwriter/coursetaskMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/contentwriter/addCourseTaskService', () => ({
    __esModule: true,
    default: { addCourseTask: jest.fn() }
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: {
        uploadThumbnailToS3: jest.fn(),
        getCourseMediaFromS3: jest.fn(),
        getCourseMediaSignedUrl: jest.fn()
    }
}));
const addCourseTaskMock = addCourseTaskService_1.default.addCourseTask;
const uploadThumbnailToS3Mock = manageCourseMedia_1.default.uploadThumbnailToS3;
const buildFile = (overrides = {}) => (Object.assign({ originalname: 'file.pdf', buffer: Buffer.from('data'), mimetype: 'application/pdf' }, overrides));
describe('addCourseTaskController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addCourseTaskMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ moduleId: 'm1', taskName: 'Read', taskDescription: 'Read the docs', link: 'https://example.com' }, overrides.body),
        files: overrides.files
    });
    it('returns 201 when a task is added with a link', async () => {
        const req = buildReq();
        addCourseTaskMock.mockResolvedValue({
            id: 't1',
            taskName: 'Read',
            taskDescription: 'Read the docs',
            type: 'LINK'
        });
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(addCourseTaskMock).toHaveBeenCalledWith('m1', 'Read', 'Read the docs', '', 'ACTIVE', 'LINK', 'https://example.com', '', '', false, '');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: coursetaskMessages_1.COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
            taskId: 't1',
            taskName: 'Read',
            taskDescription: 'Read the docs',
            type: 'LINK'
        });
    });
    it('returns 201 and uploads the content when a task file is provided', async () => {
        const req = buildReq({
            files: { taskFile: [buildFile()] }
        });
        addCourseTaskMock.mockResolvedValue({ id: 't1', taskName: 'Read', taskDescription: 'Read the docs', type: 'FILE' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'content-key' });
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'application/pdf', 'LMSData/Courses/CourseTaskContent');
        expect(addCourseTaskMock).toHaveBeenCalledWith('m1', 'Read', 'Read the docs', '', 'ACTIVE', 'FILE', expect.stringContaining('LMSData/Courses/CourseTaskContent/'), 'application/pdf', 'file.pdf', false, '');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
    });
    it('uploads the thumbnail and passes its path when a thumbnail file is provided', async () => {
        const req = buildReq({
            files: { thumbnailFile: [buildFile({ originalname: 'thumb.png', mimetype: 'image/png' })] }
        });
        addCourseTaskMock.mockResolvedValue({ id: 't1', taskName: 'Read', taskDescription: 'Read the docs', type: 'LINK' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'thumb-key' });
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'image/png', 'LMSData/Courses/CourseTaskThumbnails');
        expect(addCourseTaskMock).toHaveBeenCalledWith('m1', 'Read', 'Read the docs', expect.stringContaining('LMSData/Courses/CourseTaskThumbnails/'), 'ACTIVE', 'LINK', 'https://example.com', '', '', false, '');
    });
    it('returns 400 when there is no content', async () => {
        const req = buildReq({ body: { link: '' } });
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(addCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE
        });
    });
    it('returns 400 when the service returns a falsy result', async () => {
        const req = buildReq();
        addCourseTaskMock.mockResolvedValue(null);
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE
        });
    });
    it('returns 201 and saves a coding task with a question', async () => {
        const req = buildReq({
            body: {
                link: '',
                isCoding: 'true',
                question: 'Write a function to reverse a string.'
            }
        });
        addCourseTaskMock.mockResolvedValue({
            id: 't1',
            taskName: 'Reverse string',
            taskDescription: 'Coding task',
            type: 'LINK'
        });
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(addCourseTaskMock).toHaveBeenCalledWith('m1', 'Read', 'Read the docs', '', 'ACTIVE', 'LINK', '', '', '', true, 'Write a function to reverse a string.');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
    });
    it('returns 400 when a coding task has no question', async () => {
        const req = buildReq({
            body: {
                link: '',
                isCoding: 'true'
            }
        });
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(addCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_QUESTION_MESSAGE
        });
    });
    it('returns 500 when the service throws', async () => {
        const req = buildReq();
        addCourseTaskMock.mockRejectedValue(new Error('Service failure'));
        await addCourseTaskController_1.default.addTaskToModule(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE
        });
    });
});
