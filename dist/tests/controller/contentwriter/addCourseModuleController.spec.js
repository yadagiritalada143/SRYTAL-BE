"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseModuleController_1 = __importDefault(require("../../../controllers/contentwriter/addCourseModuleController"));
const addCourseModuleService_1 = __importDefault(require("../../../services/contentwriter/addCourseModuleService"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const coursemoduleMessages_1 = require("../../../constants/contentwriter/coursemoduleMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
const awsS3Config_1 = require("../../../config/awsS3Config");
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
const addNewCourseModuleMock = addCourseModuleService_1.default.addNewCourseModule;
const uploadThumbnailToS3Mock = manageCourseMedia_1.default.uploadThumbnailToS3;
describe('addCourseModuleController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addNewCourseModuleMock.mockReset();
        uploadThumbnailToS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 201 when the module is added without a thumbnail', async () => {
        const req = {
            body: { courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' }
        };
        addNewCourseModuleMock.mockResolvedValue({ _id: 'm1' });
        await addCourseModuleController_1.default.addModuleToCourse(req, res);
        expect(addNewCourseModuleMock).toHaveBeenCalledWith('c1', 'Intro', 'First module', '', 'ACTIVE');
        expect(uploadThumbnailToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: coursemoduleMessages_1.COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
    });
    it('uploads the thumbnail and returns 201 with the generated key', async () => {
        const req = {
            body: { courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' },
            file: { originalname: 'thumb.png', buffer: Buffer.from('data'), mimetype: 'image/png' }
        };
        addNewCourseModuleMock.mockResolvedValue({ _id: 'm1' });
        uploadThumbnailToS3Mock.mockResolvedValue({ key: 'module-thumb-key' });
        await addCourseModuleController_1.default.addModuleToCourse(req, res);
        expect(uploadThumbnailToS3Mock).toHaveBeenCalledWith(expect.any(String), Buffer.from('data'), 'image/png', awsS3Config_1.courseModuleThumbnailsFolder);
        expect(addNewCourseModuleMock).toHaveBeenCalledWith('c1', 'Intro', 'First module', 'module-thumb-key', 'ACTIVE');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({ message: coursemoduleMessages_1.COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
    });
    it('returns 500 when the service throws', async () => {
        const req = {
            body: { courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' }
        };
        addNewCourseModuleMock.mockRejectedValue(new Error('Service failure'));
        await addCourseModuleController_1.default.addModuleToCourse(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE
        });
    });
});
