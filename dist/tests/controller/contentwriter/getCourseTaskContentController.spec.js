"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseTaskContentController_1 = __importDefault(require("../../../controllers/contentwriter/getCourseTaskContentController"));
const getCourseTaskContentService_1 = __importDefault(require("../../../services/contentwriter/getCourseTaskContentService"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const coursetaskMessages_1 = require("../../../constants/contentwriter/coursetaskMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/contentwriter/getCourseTaskContentService', () => ({
    __esModule: true,
    default: { getCourseTaskContent: jest.fn() }
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: {
        uploadThumbnailToS3: jest.fn(),
        getCourseMediaFromS3: jest.fn(),
        getCourseMediaSignedUrl: jest.fn()
    }
}));
const getCourseTaskContentMock = getCourseTaskContentService_1.default.getCourseTaskContent;
const getCourseMediaFromS3Mock = manageCourseMedia_1.default.getCourseMediaFromS3;
describe('getCourseTaskContentController', () => {
    let mockJson;
    let mockStatus;
    let mockRedirect;
    let mockSetHeader;
    let mockSend;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockSend = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: mockSend });
        mockRedirect = jest.fn();
        mockSetHeader = jest.fn();
        res = {
            status: mockStatus,
            json: mockJson,
            redirect: mockRedirect,
            setHeader: mockSetHeader,
            send: mockSend
        };
        getCourseTaskContentMock.mockReset();
        getCourseMediaFromS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (id) => ({ params: { id } });
    it('redirects to the external link for a LINK task', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: { _id: 't1', type: 'LINK', content: 'https://example.com/video' }
        });
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(mockRedirect).toHaveBeenCalledWith('https://example.com/video');
        expect(getCourseMediaFromS3Mock).not.toHaveBeenCalled();
    });
    it('streams the file from S3 for a FILE task', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: {
                _id: 't1',
                type: 'FILE',
                content: 'LMSData/Courses/CourseTaskContent/file.pdf',
                contentMimeType: 'application/pdf',
                contentFileName: 'file.pdf',
                taskName: 'Read'
            }
        });
        getCourseMediaFromS3Mock.mockResolvedValue({ contentType: 'application/pdf', body: Buffer.from('pdf') });
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(getCourseMediaFromS3Mock).toHaveBeenCalledWith('LMSData/Courses/CourseTaskContent/file.pdf');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('inline;'));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockSend).toHaveBeenCalledWith(Buffer.from('pdf'));
    });
    it('falls back to the s3 content type when the task has no mime type', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: { _id: 't1', type: 'FILE', content: 'key', contentMimeType: '', taskName: 'Read' }
        });
        getCourseMediaFromS3Mock.mockResolvedValue({ contentType: 'video/mp4', body: Buffer.from('v') });
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
    });
    it('returns 404 when the task is not found', async () => {
        getCourseTaskContentMock.mockResolvedValue({ success: false });
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
        });
    });
    it('returns 404 when the task has no content', async () => {
        getCourseTaskContentMock.mockResolvedValue({ success: true, task: { _id: 't1', type: 'LINK', content: '' } });
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND);
    });
    it('returns 500 when the s3 fetch fails', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: { _id: 't1', type: 'FILE', content: 'key', contentMimeType: '', taskName: 'Read' }
        });
        getCourseMediaFromS3Mock.mockRejectedValue(new Error('S3 down'));
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE
        });
    });
    it('returns 500 when the service throws', async () => {
        getCourseTaskContentMock.mockRejectedValue(new Error('Service failure'));
        await getCourseTaskContentController_1.default.getCourseTaskContent(buildReq('t1'), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE
        });
    });
});
