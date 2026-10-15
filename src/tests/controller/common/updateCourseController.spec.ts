import { Request, Response } from 'express';
import updateCourseController from '../../../controllers/contentwriter/updateCourseController';
import updateCourseService from '../../../services/contentwriter/updateCourseService';
import isValidStatus from '../../../util/validateCourseStatusTypesUtil';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import { COURSE_ERROR_MESSAGES } from '../../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

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

const updateCourseMock = updateCourseService.updateCourse as unknown as jest.Mock;
const isValidStatusMock = isValidStatus as unknown as jest.Mock;
const uploadThumbnailToS3Mock = uploadThumbnailToS3.uploadThumbnailToS3 as unknown as jest.Mock;

describe('updateCourseController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateCourseMock.mockReset();
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
                id: 'c1',
                courseName: 'React',
                courseDescription: 'Frontend',
                status: 'active',
                ...overrides.body
            },
            file: overrides.file
        } as unknown as Request);

    it('returns 400 when the status is invalid', async () => {
        isValidStatusMock.mockReturnValue(false);
        const req = buildReq();

        await updateCourseController.updateCourse(req, res);

        expect(updateCourseMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_INVALID_STATUS_MESSAGE
        });
    });

    it('updates the course without a thumbnail and returns 200', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        const updateResponse = { success: true, responseAfterUpdateCourse: { modifiedCount: 1 } };
        updateCourseMock.mockResolvedValue(updateResponse);

        await updateCourseController.updateCourse(req, res);

        expect(updateCourseMock).toHaveBeenCalledWith('c1', 'React', 'Frontend', undefined, 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
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

        await updateCourseController.updateCourse(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'image/png',
            'LMSData/Courses/CourseThumbnails'
        );
        expect(updateCourseMock).toHaveBeenCalledWith('c1', 'React', 'Frontend', 'new-thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
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
        } as unknown as Response;

        await updateCourseController.updateCourse(req, failedRes);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE
        });
        expect(updateCourseMock).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        updateCourseMock.mockRejectedValue(new Error('Service failure'));

        await updateCourseController.updateCourse(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_UPDATE_ERROR_MESSAGE
        });
    });
});