import uploadProfileImageService from '../../../services/common/uploadProfileImageService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

const findByIdAndUpdateMock = (UserModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

describe('uploadProfileImageService', () => {
    beforeEach(() => {
        findByIdAndUpdateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates the profile image and returns success', async () => {
        findByIdAndUpdateMock.mockResolvedValue({ _id: 'u1', profileImage: 'abc.png' });

        const result = await uploadProfileImageService.updateProfileImageDetails('abc.png', 'u1');

        expect(findByIdAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
            'u1',
            { profileImage: 'abc.png' },
            { new: true }
        );
        expect(result).toEqual({ success: true });
    });

    it('returns success false with the error when the update throws', async () => {
        const updateError = new Error('DB down');
        findByIdAndUpdateMock.mockRejectedValue(updateError);

        const result = await uploadProfileImageService.updateProfileImageDetails('abc.png', 'u1');

        expect(findByIdAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, error: updateError });
    });
});