import getProfileImageService from '../../../services/common/getProfileImageService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const findByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;

describe('getProfileImageService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the profile image path when the user has one', async () => {
        findByIdMock.mockResolvedValue({ profileImage: 'abc.png' });

        const result = await getProfileImageService.getProfileImage('u1');

        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith({ _id: 'u1' });
        expect(result).toEqual({ success: true, imagePath: 'abc.png' });
    });

    it('returns an empty image path when the user has no profile image', async () => {
        findByIdMock.mockResolvedValue(null as any);

        const result = await getProfileImageService.getProfileImage('u1');

        expect(result).toEqual({ success: true, imagePath: '' });
    });

    it('returns success false with the error when the lookup throws', async () => {
        const lookupError = new Error('DB down');
        findByIdMock.mockRejectedValue(lookupError);

        const result = await getProfileImageService.getProfileImage('u1');

        expect(result).toEqual({ success: false, error: lookupError });
    });
});