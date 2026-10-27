import { Request, Response } from 'express';
import getProfileImageController from '../../../controllers/common/getProfileImageController';
import getProfileImageService from '../../../services/common/getProfileImageService';
import getImageFromS3Utility from '../../../util/manageProfileImages';
import { EMPLOYEE_ERRORS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/getProfileImageService', () => ({
    __esModule: true,
    default: { getProfileImage: jest.fn() }
}));

jest.mock('../../../util/manageProfileImages', () => ({
    __esModule: true,
    default: { getProfileImageFromS3: jest.fn() }
}));

const getProfileImageServiceMock = getProfileImageService.getProfileImage as unknown as jest.Mock;
const getProfileImageFromS3Mock = getImageFromS3Utility.getProfileImageFromS3 as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getProfileImageController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let mockSend: jest.Mock;
    let mockSetHeader: jest.Mock;
    let res: Response;

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
        } as unknown as Response;
        getProfileImageServiceMock.mockReset();
        getProfileImageFromS3Mock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 401 when there is no authenticated user', async () => {
        const req = {} as unknown as Request;

        await getProfileImageController.getProfileImage(req, res);

        expect(getProfileImageServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('streams the profile image from S3 on success', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        getProfileImageServiceMock.mockResolvedValue({ success: true, imagePath: 'abc.png' });
        getProfileImageFromS3Mock.mockResolvedValue({
            success: true,
            imageDetails: { contentType: 'image/png', body: Buffer.from('img') }
        });

        await getProfileImageController.getProfileImage(req, res);
        await flushMicrotasks();

        expect(getProfileImageServiceMock).toHaveBeenCalledWith('u1');
        expect(getProfileImageFromS3Mock).toHaveBeenCalledTimes(1);
        expect(getProfileImageFromS3Mock).toHaveBeenCalledWith('abc.png', 'ProfileImages');
        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockSend).toHaveBeenCalledWith(Buffer.from('img'));
    });

    it('returns 500 when the service reports a failure', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        getProfileImageServiceMock.mockResolvedValue({ success: false });

        await getProfileImageController.getProfileImage(req, res);
        await flushMicrotasks();

        expect(getProfileImageFromS3Mock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR
        });
    });

    it('returns 401 with the S3 error when fetching from S3 fails', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        const s3Error = { message: 's3 failed' };
        getProfileImageServiceMock.mockResolvedValue({ success: true, imagePath: 'abc.png' });
        getProfileImageFromS3Mock.mockRejectedValue(s3Error);

        await getProfileImageController.getProfileImage(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith(s3Error);
    });

    it('returns 500 when the service throws', async () => {
        const req = { user: { userId: 'u1' } } as unknown as Request;
        getProfileImageServiceMock.mockRejectedValue(new Error('boom'));

        await getProfileImageController.getProfileImage(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYEE_ERRORS.EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR
        });
    });
});