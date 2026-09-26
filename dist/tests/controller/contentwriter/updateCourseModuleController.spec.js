"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseModuleController_1 = __importDefault(require("../../../controllers/contentwriter/updateCourseModuleController"));
const updateCourseModuleService_1 = __importDefault(require("../../../services/contentwriter/updateCourseModuleService"));
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../../util/validateCourseStatusTypesUtil"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const coursemoduleMessages_1 = require("../../../constants/contentwriter/coursemoduleMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
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
const updateCourseModuleMock = updateCourseModuleService_1.default.updateCourseModule;
const isValidStatusMock = validateCourseStatusTypesUtil_1.default;
const uploadThumbnailToS3Mock = manageCourseMedia_1.default.uploadThumbnailToS3;
describe('updateCourseModuleController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateCourseModuleMock.mockReset();
        isValidStatusMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ id: 'm1', moduleName: 'Intro', moduleDescription: 'First module', status: 'active' }, overrides.body),
        file: overrides.file
    });
    it('returns 400 when the status is invalid', async () => {
        isValidStatusMock.mockReturnValue(false);
        const req = buildReq();
        await updateCourseModuleController_1.default.updateCourseModule(req, res);
        expect(updateCourseModuleMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_STATUS_MESSAGE
        });
    });
    it('updates the module without a thumbnail and returns 200', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        const updateResponse = { success: true, responseAfterModuleUpdate: { modifiedCount: 1 } };
        updateCourseModuleMock.mockResolvedValue(updateResponse);
        await updateCourseModuleController_1.default.updateCourseModule(req, res);
        expect(updateCourseModuleMock).toHaveBeenCalledWith('m1', 'Intro', 'First module', undefined, 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
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
        await updateCourseModuleController_1.default.updateCourseModule(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'image/png', 'LMSData/Courses/CourseModuleThumbnail');
        expect(updateCourseModuleMock).toHaveBeenCalledWith('m1', 'Intro', 'First module', 'new-module-thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
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
        };
        await updateCourseModuleController_1.default.updateCourseModule(req, failedRes);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE
        });
        expect(updateCourseModuleMock).not.toHaveBeenCalled();
    });
    it('returns 500 when the service throws', async () => {
        isValidStatusMock.mockReturnValue(true);
        const req = buildReq();
        updateCourseModuleMock.mockRejectedValue(new Error('Service failure'));
        await updateCourseModuleController_1.default.updateCourseModule(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE
        });
    });
});
