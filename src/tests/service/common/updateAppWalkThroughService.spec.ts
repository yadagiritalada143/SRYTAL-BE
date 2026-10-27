import updateAppWalkThroughService from '../../../services/common/updateAppWalkThroughService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));

const updateOneMock = (UserModel as unknown as { updateOne: jest.Mock }).updateOne;

describe('updateAppWalkThroughService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates the walk through flag and returns the result', async () => {
        const result = { nModified: 1 };
        updateOneMock.mockResolvedValue(result);

        const response = await updateAppWalkThroughService.updateAppWalkThrough({
            user_id: 'u1',
            applicationWalkThrough: '1'
        });

        expect(updateOneMock).toHaveBeenCalledTimes(1);
        expect(updateOneMock).toHaveBeenCalledWith(
            { _id: 'u1' },
            { applicationWalkThrough: 1 }
        );
        expect(response).toEqual(result);
    });

    it('returns the error when the update throws', async () => {
        const updateError = new Error('DB down');
        updateOneMock.mockRejectedValue(updateError);

        const response = await updateAppWalkThroughService.updateAppWalkThrough({
            user_id: 'u1',
            applicationWalkThrough: 0
        });

        expect(response).toBe(updateError);
    });
});