"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getProfileImageService_1 = __importDefault(require("../../../services/common/getProfileImageService"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
const findByIdMock = userModel_1.default.findById;
describe('getProfileImageService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the profile image path when the user has one', async () => {
        findByIdMock.mockResolvedValue({ profileImage: 'abc.png' });
        const result = await getProfileImageService_1.default.getProfileImage('u1');
        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith({ _id: 'u1' });
        expect(result).toEqual({ success: true, imagePath: 'abc.png' });
    });
    it('returns an empty image path when the user has no profile image', async () => {
        findByIdMock.mockResolvedValue(null);
        const result = await getProfileImageService_1.default.getProfileImage('u1');
        expect(result).toEqual({ success: true, imagePath: '' });
    });
    it('returns success false with the error when the lookup throws', async () => {
        const lookupError = new Error('DB down');
        findByIdMock.mockRejectedValue(lookupError);
        const result = await getProfileImageService_1.default.getProfileImage('u1');
        expect(result).toEqual({ success: false, error: lookupError });
    });
});
