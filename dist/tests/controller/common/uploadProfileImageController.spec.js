"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uploadProfileImageController_1 = __importDefault(require("../../../controllers/common/uploadProfileImageController"));
const manageProfileImages_1 = __importDefault(require("../../../util/manageProfileImages"));
const uploadProfileImageService_1 = __importDefault(require("../../../services/common/uploadProfileImageService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../util/manageProfileImages', () => ({
    __esModule: true,
    default: { uploadImageToS3: jest.fn() }
}));
jest.mock('../../../services/common/uploadProfileImageService', () => ({
    __esModule: true,
    default: { updateProfileImageDetails: jest.fn() }
}));
jest.mock('uuid', () => ({
    v4: jest.fn()
}));
const uploadImageToS3Mock = manageProfileImages_1.default.uploadImageToS3;
const updateProfileImageDetailsMock = uploadProfileImageService_1.default.updateProfileImageDetails;
const { v4: uuidV4Mock } = require('uuid');
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('uploadProfileImageController', () => {
    let mockJson;
    let mockStatus;
    let mockSend;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockSend = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: mockSend });
        res = { status: mockStatus, json: mockJson, send: mockSend };
        uploadImageToS3Mock.mockReset();
        updateProfileImageDetailsMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = () => ({
        file: {
            originalname: 'photo.png',
            buffer: Buffer.from('image-data'),
            mimetype: 'image/png'
        },
        body: { userId: 'u1' }
    });
    it('returns 400 when no file is uploaded', async () => {
        const req = {};
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        expect(uploadImageToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockSend).toHaveBeenCalledWith('No file uploaded.');
    });
    it('uploads the image and returns 200 when the profile image details are updated', async () => {
        const req = buildReq();
        uploadImageToS3Mock.mockResolvedValue({ Location: 'https://s3/ProfileImages/name.png' });
        updateProfileImageDetailsMock.mockResolvedValue({ success: true });
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        await flushMicrotasks();
        expect(uploadImageToS3Mock).toHaveBeenCalledTimes(1);
        expect(uploadImageToS3Mock.mock.calls[0][0]).toMatch(/\.png$/);
        expect(uploadImageToS3Mock.mock.calls[0][1]).toEqual(Buffer.from('image-data'));
        expect(uploadImageToS3Mock.mock.calls[0][2]).toBe('image/png');
        expect(uploadImageToS3Mock.mock.calls[0][3]).toBe('ProfileImages');
        expect(updateProfileImageDetailsMock).toHaveBeenCalledTimes(1);
        expect(updateProfileImageDetailsMock.mock.calls[0][1]).toBe('u1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });
    it('returns 401 when the service reports a failure after upload', async () => {
        const req = buildReq();
        uploadImageToS3Mock.mockResolvedValue({ Location: 'https://s3/ProfileImages/name.png' });
        updateProfileImageDetailsMock.mockResolvedValue({ success: false });
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.UNAUTHORIZED);
        expect(mockJson).toHaveBeenCalledWith({ success: false });
    });
    it('returns 500 when there is no Location in the S3 upload response', async () => {
        const req = buildReq();
        uploadImageToS3Mock.mockResolvedValue({});
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        await flushMicrotasks();
        expect(updateProfileImageDetailsMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR
        });
    });
    it('returns 500 when the S3 upload rejects', async () => {
        const req = buildReq();
        uploadImageToS3Mock.mockRejectedValue(new Error('s3 failed'));
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        await flushMicrotasks();
        expect(updateProfileImageDetailsMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR
        });
    });
    it('returns 500 when updating the profile image details throws', async () => {
        const req = buildReq();
        uploadImageToS3Mock.mockResolvedValue({ Location: 'https://s3/ProfileImages/name.png' });
        updateProfileImageDetailsMock.mockRejectedValue(new Error('db failed'));
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR
        });
    });
    it('returns 500 when a synchronous error occurs during processing', async () => {
        const req = buildReq();
        uuidV4Mock.mockImplementation(() => {
            throw new Error('uuid failed');
        });
        await uploadProfileImageController_1.default.uploadProfileImage(req, res);
        await flushMicrotasks();
        expect(uploadImageToS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR
        });
    });
});
