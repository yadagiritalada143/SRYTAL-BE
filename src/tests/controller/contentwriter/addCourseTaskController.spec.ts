import { Request, Response } from 'express';
import addCourseTaskController from '../../../controllers/contentwriter/addCourseTaskController';
import addCourseTaskService from '../../../services/contentwriter/addCourseTaskService';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import {
    COURSE_TASK_SUCCESS_MESSAGES,
    COURSE_TASK_ERRORS_MESSAGES
} from '../../../constants/contentwriter/coursetaskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

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

const addCourseTaskMock = addCourseTaskService.addCourseTask as unknown as jest.Mock;
const uploadThumbnailToS3Mock = uploadThumbnailToS3.uploadThumbnailToS3 as unknown as jest.Mock;

const buildFile = (overrides: any = {}) => ({
    originalname: 'file.pdf',
    buffer: Buffer.from('data'),
    mimetype: 'application/pdf',
    ...overrides
});

describe('addCourseTaskController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addCourseTaskMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            body: {
                moduleId: 'm1',
                taskName: 'Read',
                taskDescription: 'Read the docs',
                link: 'https://example.com',
                ...overrides.body
            },
            files: overrides.files
        } as unknown as Request);

    it('returns 201 when a task is added with a link', async () => {
        const req = buildReq();
        addCourseTaskMock.mockResolvedValue({
            id: 't1',
            taskName: 'Read',
            taskDescription: 'Read the docs',
            type: 'LINK'
        });

        await addCourseTaskController.addTaskToModule(req, res);

        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(addCourseTaskMock).toHaveBeenCalledWith(
            'm1',
            'Read',
            'Read the docs',
            '',
            'ACTIVE',
            'LINK',
            'https://example.com',
            '',
            ''
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE,
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

        await addCourseTaskController.addTaskToModule(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'application/pdf',
            'LMSData/Courses/CourseTaskContent'
        );
        expect(addCourseTaskMock).toHaveBeenCalledWith(
            'm1',
            'Read',
            'Read the docs',
            '',
            'ACTIVE',
            'FILE',
            expect.stringContaining('LMSData/Courses/CourseTaskContent/'),
            'application/pdf',
            'file.pdf'
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    });

    it('uploads the thumbnail and passes its path when a thumbnail file is provided', async () => {
        const req = buildReq({
            files: { thumbnailFile: [buildFile({ originalname: 'thumb.png', mimetype: 'image/png' })] }
        });
        addCourseTaskMock.mockResolvedValue({ id: 't1', taskName: 'Read', taskDescription: 'Read the docs', type: 'LINK' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'thumb-key' });

        await addCourseTaskController.addTaskToModule(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'image/png',
            'LMSData/Courses/CourseTaskThumbnails'
        );
        expect(addCourseTaskMock).toHaveBeenCalledWith(
            'm1',
            'Read',
            'Read the docs',
            expect.stringContaining('LMSData/Courses/CourseTaskThumbnails/'),
            'ACTIVE',
            'LINK',
            'https://example.com',
            '',
            ''
        );
    });

    it('returns 400 when there is no content', async () => {
        const req = buildReq({ body: { link: '' } });

        await addCourseTaskController.addTaskToModule(req, res);

        expect(addCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MISSING_CONTENT_MESSAGE
        });
    });

    it('returns 400 when the service returns a falsy result', async () => {
        const req = buildReq();
        addCourseTaskMock.mockResolvedValue(null);

        await addCourseTaskController.addTaskToModule(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        const req = buildReq();
        addCourseTaskMock.mockRejectedValue(new Error('Service failure'));

        await addCourseTaskController.addTaskToModule(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE
        });
    });
});