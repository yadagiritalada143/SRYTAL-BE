"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uploadProfileImageService_1 = __importDefault(require("../../../services/common/uploadProfileImageService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));
const findByIdAndUpdateMock = userModel_1.default.findByIdAndUpdate;
describe('uploadProfileImageService', () => {
    beforeEach(() => {
        findByIdAndUpdateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates the profile image and returns success', async () => {
        findByIdAndUpdateMock.mockResolvedValue({ _id: 'u1', profileImage: 'abc.png' });
        const result = await uploadProfileImageService_1.default.updateProfileImageDetails('abc.png', 'u1');
        expect(findByIdAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith('u1', { profileImage: 'abc.png' }, { new: true });
        expect(result).toEqual({ success: true });
    });
    it('returns success false with the error when the update throws', async () => {
        const updateError = new Error('DB down');
        findByIdAndUpdateMock.mockRejectedValue(updateError);
        const result = await uploadProfileImageService_1.default.updateProfileImageDetails('abc.png', 'u1');
        expect(findByIdAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false, error: updateError });
    });
});
