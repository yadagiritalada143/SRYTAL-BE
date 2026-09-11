import { Request, Response } from 'express';
import updateCourseTaskController from '../../../controllers/contentwriter/updateCourseTaskController';
import updateCourseTaskService from '../../../services/contentwriter/updateCourseTaskService';
import isValidStatus from '../../../util/validateCourseStatusTypesUtil';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import { COURSE_TASK_ERRORS_MESSAGES } from '../../../constants/contentwriter/coursetaskMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

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

const updateCourseTaskMock = updateCourseTaskService.updateCourseTask as unknown as jest.Mock;
const isValidStatusMock = isValidStatus as unknown as jest.Mock;
const uploadThumbnailToS3Mock = uploadThumbnailToS3.uploadThumbnailToS3 as unknown as jest.Mock;

const buildFile = (overrides: any = {}) => ({
    originalname: 'file.pdf',
    buffer: Buffer.from('data'),
    mimetype: 'application/pdf',
    ...overrides
});

describe('updateCourseTaskController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateCourseTaskMock.mockReset();
        isValidStatusMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildReq = (overrides: any = {}) =>
        ({
            body: {
                id: 't1',
                taskName: 'Read',
                taskDescription: 'Read the docs',
                status: 'active',
                ...overrides.body
            },
            files: overrides.files
        } as unknown as Request);

    it('returns 400 when the status is invalid', async () => {
        isValidStatusMock.mockReturnValue(false);
        const req = buildReq();

        await updateCourseTaskController.updateCourseTask(req, res);

        expect(updateCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE
        });
    });

    it('updates the task without files and returns 200', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateCourseTaskMock.mockResolvedValue(updateResponse);

        await updateCourseTaskController.updateCourseTask(req, res);

        expect(updateCourseTaskMock).toHaveBeenCalledWith(
            't1',
            'Read',
            'Read the docs',
            undefined,
            'ACTIVE',
            undefined,
            undefined,
            undefined
        );
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
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

        await updateCourseTaskController.updateCourseTask(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'application/pdf',
            'LMSData/Courses/CourseTaskContent'
        );
        expect(updateCourseTaskMock).toHaveBeenCalledWith(
            't1',
            'Read',
            'Read the docs',
            undefined,
            'ACTIVE',
            expect.stringContaining('LMSData/Courses/CourseTaskContent/'),
            'application/pdf',
            'file.pdf'
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 400 when the thumbnail type is invalid', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            files: { thumbnailFile: [buildFile({ originalname: 'thumb.gif', mimetype: 'image/gif' })] }
        });

        await updateCourseTaskController.updateCourseTask(req, res);

        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(updateCourseTaskMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_THUMBNAIL_TYPE_MESSAGE
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

        await updateCourseTaskController.updateCourseTask(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'image/png',
            'LMSData/Courses/CourseTaskThumbnails'
        );
        expect(updateCourseTaskMock).toHaveBeenCalledWith(
            't1',
            'Read',
            'Read the docs',
            expect.stringContaining('LMSData/Courses/CourseTaskThumbnails/'),
            'ACTIVE',
            undefined,
            undefined,
            undefined
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 when the service throws', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        updateCourseTaskMock.mockRejectedValue(new Error('Service failure'));

        await updateCourseTaskController.updateCourseTask(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE
        });
    });
});