import { Request, Response } from 'express';
import updateCourseModuleController from '../../../controllers/contentwriter/updateCourseModuleController';
import updateCourseModuleService from '../../../services/contentwriter/updateCourseModuleService';
import isValidStatus from '../../../util/validateCourseStatusTypesUtil';
import uploadThumbnailToS3 from '../../../util/manageCourseMedia';
import { COURSE_MODULE_ERRORS_MESSAGES } from '../../../constants/contentwriter/coursemoduleMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/updateCourseModuleService', () => ({
    __esModule: true,
    default: { updateCourseModule: jest.fn() }
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

const updateCourseModuleMock = updateCourseModuleService.updateCourseModule as unknown as jest.Mock;
const isValidStatusMock = isValidStatus as unknown as jest.Mock;
const uploadThumbnailToS3Mock = uploadThumbnailToS3.uploadThumbnailToS3 as unknown as jest.Mock;

describe('updateCourseModuleController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateCourseModuleMock.mockReset();
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
                id: 'm1',
                moduleName: 'Intro',
                moduleDescription: 'First module',
                status: 'active',
                ...overrides.body
            },
            file: overrides.file
        } as unknown as Request);

    it('returns 400 when the status is invalid', async () => {
        isValidStatusMock.mockReturnValue(false);
        const req = buildReq();

        await updateCourseModuleController.updateCourseModule(req, res);

        expect(updateCourseModuleMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_STATUS_MESSAGE
        });
    });

    it('updates the module without a thumbnail and returns 200', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        const updateResponse = { success: true, responseAfterModuleUpdate: { modifiedCount: 1 } };
        updateCourseModuleMock.mockResolvedValue(updateResponse);

        await updateCourseModuleController.updateCourseModule(req, res);

        expect(updateCourseModuleMock).toHaveBeenCalledWith('m1', 'Intro', 'First module', undefined, 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });

    it('uploads a new thumbnail and passes its key to the service', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq({
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        });
        const updateResponse = { success: true, responseAfterModuleUpdate: { modifiedCount: 1 } };
        updateCourseModuleMock.mockResolvedValue(updateResponse);
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'new-module-thumb-key' });

        await updateCourseModuleController.updateCourseModule(req, res);

        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(
            expect.any(String),
            Buffer.from('data'),
            'image/png',
            'LMSData/Courses/CourseModuleThumbnail'
        );
        expect(updateCourseModuleMock).toHaveBeenCalledWith('m1', 'Intro', 'First module', 'new-module-thumb-key', 'ACTIVE');
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

        await updateCourseModuleController.updateCourseModule(req, failedRes);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE
        });
        expect(updateCourseModuleMock).not.toHaveBeenCalled();
    });

    it('returns 500 when the service throws', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        updateCourseModuleMock.mockRejectedValue(new Error('Service failure'));

        await updateCourseModuleController.updateCourseModule(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE
        });
    });
});