import { Request, Response } from 'express';
import addCourseController from '../../../controllers/contentwriter/addCourseController';
import addCourseService from '../../../services/contentwriter/addCourseService';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import { COURSE_SUCCESS_MESSAGES, COURSE_ERROR_MESSAGES } from '../../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { coursesThumbnailsFolder } from '../../../config/awsS3Config';

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

const addCourseMock = addCourseService.addCourse as unknown as jest.Mock;
const uploadThumbnailToS3Mock = uploadThumbnailToS3.uploadThumbnailToS3 as unknown as jest.Mock;

describe('addCourseController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addCourseMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 201 when the course is added without a thumbnail', async () => {
        const req = { body: { courseName: 'React', courseDescription: 'Frontend' } } as unknown as Request;
        addCourseMock.mockResolvedValue({ _id: 'c1' });

        await addCourseController.addNewCourse(req, res);

        expect(addCourseMock).toHaveBeenCalledWith('React', 'Frontend', '', 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
    });

    it('uploads the thumbnail and returns 201 with the generated key', async () => {
        const req = {
            body: { courseName: 'React', courseDescription: 'Frontend' },
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        } as unknown as Request;
        addCourseMock.mockResolvedValue({ _id: 'c1' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'thumb-key' });

        await addCourseController.addNewCourse(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'image/png',
            coursesThumbnailsFolder
        );
        expect(addCourseMock).toHaveBeenCalledWith('React', 'Frontend', 'thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: COURSE_SUCCESS_MESSAGES.COURSE_ADD_SUCCESS_MESSAGE });
    });

    it('returns 500 when the service throws', async () => {
        const req = { body: { courseName: 'React', courseDescription: 'Frontend' } } as unknown as Request;
        addCourseMock.mockRejectedValue(new Error('Service failure'));

        await addCourseController.addNewCourse(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE
        });
    });
});