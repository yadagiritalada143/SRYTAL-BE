"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProfileImageController_1 = __importDefault(require("../../../controllers/common/getProfileImageController"));
const getProfileImageService_1 = __importDefault(require("../../../services/common/getProfileImageService"));
const manageProfileImages_1 = __importDefault(require("../../../util/manageProfileImages"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/common/getProfileImageService', () => ({
    __esModule: true,
    default: { getProfileImage: jest.fn() }
}));
jest.mock('../../../util/manageProfileImages', () => ({
    __esModule: true,
    default: { getProfileImageFromS3: jest.fn() }
}));
const getProfileImageServiceMock = getProfileImageService_1.default.getProfileImage;
const getProfileImageFromS3Mock = manageProfileImages_1.default.getProfileImageFromS3;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getProfileImageController', () => {
    let mockJson;
    let mockStatus;
    let mockSend;
    let mockSetHeader;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockSend = jest.fn();
        mockSetHeader = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson, send: mockSend });
        res = {
            status: mockStatus,
            json: mockJson,
            send: mockSend,
            setHeader: mockSetHeader
        };
        getProfileImageServiceMock.mockReset();
        getProfileImageFromS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 401 when there is no authenticated user', async () => {
        const req = {};
        await getProfileImageController_1.default.getProfileImage(req, res);
        expect(getProfileImageServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
    it('streams the profile image from S3 on success', async () => {
        const req = { user: { userId: 'u1' } };
        getProfileImageServiceMock.mockResolvedValue({ success: true, imagePath: 'abc.png' });
        getProfileImageFromS3Mock.mockResolvedValue({
            success: true,
            imageDetails: { contentType: 'image/png', body: Buffer.from('img') }
        });
        await getProfileImageController_1.default.getProfileImage(req, res);
        await flushMicrotasks();
        expect(getProfileImageServiceMock).toHaveBeenCalledWith('u1');
        expect(getProfileImageFromS3Mock).toHaveBeenCalledTimes(1);
        expect(getProfileImageFromS3Mock).toHaveBeenCalledWith('abc.png', 'ProfileImages');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockSend).toHaveBeenCalledWith(Buffer.from('img'));
    });
    it('returns 500 when the service reports a failure', async () => {
        const req = { user: { userId: 'u1' } };
        getProfileImageServiceMock.mockResolvedValue({ success: false });
        await getProfileImageController_1.default.getProfileImage(req, res);
        await flushMicrotasks();
        expect(getProfileImageFromS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR
        });
    });
    it('returns 401 with the S3 error when fetching from S3 fails', async () => {
        const req = { user: { userId: 'u1' } };
        const s3Error = { message: 's3 failed' };
        getProfileImageServiceMock.mockResolvedValue({ success: true, imagePath: 'abc.png' });
        getProfileImageFromS3Mock.mockRejectedValue(s3Error);
        await getProfileImageController_1.default.getProfileImage(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith(s3Error);
    });
    it('returns 500 when the service throws', async () => {
        const req = { user: { userId: 'u1' } };
        getProfileImageServiceMock.mockRejectedValue(new Error('boom'));
        await getProfileImageController_1.default.getProfileImage(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR
        });
    });
});
