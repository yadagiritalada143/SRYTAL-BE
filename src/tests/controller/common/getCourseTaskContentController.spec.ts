import { Request, Response } from 'express';
import getCourseTaskContentController from '../../../controllers/contentwriter/getCourseTaskContentController';
import getCourseTaskContentService from '../../../services/contentwriter/getCourseTaskContentService';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../../constants/contentwriter/coursetaskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

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

const getCourseTaskContentMock = getCourseTaskContentService.getCourseTaskContent as unknown as jest.Mock;
const getCourseMediaFromS3Mock = uploadThumbnailToS3.getCourseMediaFromS3 as unknown as jest.Mock;

describe('getCourseTaskContentController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockRedirect: jest.Mock;
    let mockSetHeader: jest.Mock;
    let mockSend: jest.Mock;
    let res: Response;

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
        } as unknown as Response;
        getCourseTaskContentMock.mockReset();
        getCourseMediaFromS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (id: string) => ({ params: { id } } as unknown as Request);

    it('redirects to the external link for a LINK task', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: { _id: 't1', type: 'LINK', content: 'https://example.com/video' }
        });

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

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

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

        expect(getCourseMediaFromS3Mock).toHaveBeenCalledWith('LMSData/Courses/CourseTaskContent/file.pdf');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('inline;'));
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockSend).toHaveBeenCalledWith(Buffer.from('pdf'));
    });

    it('falls back to the s3 content type when the task has no mime type', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: { _id: 't1', type: 'FILE', content: 'key', contentMimeType: '', taskName: 'Read' }
        });
        getCourseMediaFromS3Mock.mockResolvedValue({ contentType: 'video/mp4', body: Buffer.from('v') });

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
    });

    it('returns 404 when the task is not found', async () => {
        getCourseTaskContentMock.mockResolvedValue({ success: false });

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_FOUND_MESSAGE
        });
    });

    it('returns 404 when the task has no content', async () => {
        getCourseTaskContentMock.mockResolvedValue({ success: true, task: { _id: 't1', type: 'LINK', content: '' } });

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    });

    it('returns 500 when the s3 fetch fails', async () => {
        getCourseTaskContentMock.mockResolvedValue({
            success: true,
            task: { _id: 't1', type: 'FILE', content: 'key', contentMimeType: '', taskName: 'Read' }
        });
        getCourseMediaFromS3Mock.mockRejectedValue(new Error('S3 down'));

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        getCourseTaskContentMock.mockRejectedValue(new Error('Service failure'));

        await getCourseTaskContentController.getCourseTaskContent(buildReq('t1'), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE
        });
    });
});