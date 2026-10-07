import { Request, Response } from 'express';
import addCourseModuleController from '../../../controllers/contentwriter/addCourseModuleController';
import addCourseModuleService from '../../../services/contentwriter/addCourseModuleService';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import { COURSE_MODULE_SUCCESS_MESSAGES, COURSE_MODULE_ERRORS_MESSAGES } from '../../../constants/contentwriter/coursemoduleMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { courseModuleThumbnailsFolder } from '../../../config/awsS3Config';

jest.mock('../../../services/contentwriter/addCourseModuleService', () => ({
    __esModule: true,
    default: { addNewCourseModule: jest.fn() }
}));

jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: {
        uploadThumbnailToS3: jest.fn(),
        getCourseMediaFromS3: jest.fn(),
        getCourseMediaSignedUrl: jest.fn()
    }
}));

const addNewCourseModuleMock = addCourseModuleService.addNewCourseModule as unknown as jest.Mock;
const uploadThumbnailToS3Mock = uploadThumbnailToS3.uploadThumbnailToS3 as unknown as jest.Mock;

describe('addCourseModuleController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addNewCourseModuleMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 201 when the module is added without a thumbnail', async () => {
        const req = {
            body: { courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' }
        } as unknown as Request;
        addNewCourseModuleMock.mockResolvedValue({ _id: 'm1' });

        await addCourseModuleController.addModuleToCourse(req, res);

        expect(addNewCourseModuleMock).toHaveBeenCalledWith('c1', 'Intro', 'First module', '', 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
    });

    it('uploads the thumbnail and returns 201 with the generated key', async () => {
        const req = {
            body: { courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' },
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        } as unknown as Request;
        addNewCourseModuleMock.mockResolvedValue({ _id: 'm1' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'module-thumb-key' });

        await addCourseModuleController.addModuleToCourse(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'image/png',
            courseModuleThumbnailsFolder
        );
        expect(addNewCourseModuleMock).toHaveBeenCalledWith('c1', 'Intro', 'First module', 'module-thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
    });

    it('returns 500 when the service throws', async () => {
        const req = {
            body: { courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' }
        } as unknown as Request;
        addNewCourseModuleMock.mockRejectedValue(new Error('Service failure'));

        await addCourseModuleController.addModuleToCourse(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE
        });
    });
});