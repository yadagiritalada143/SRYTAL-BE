import { Request, Response } from 'express';
import updateApplicationWalkThroughController from '../../../controllers/common/updateApplicationWalkThroughController';
import updateAppWalkThroughService from '../../../services/common/updateAppWalkThroughService';
import { APPLICATION_WALK_THROUGH_ERROR_MESSAGE } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/common/updateAppWalkThroughService', () => ({
    __esModule: true,
    default: { updateAppWalkThrough: jest.fn() }
}));

const updateAppWalkThroughServiceMock = updateAppWalkThroughService.updateAppWalkThrough as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateApplicationWalkThroughController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateAppWalkThroughServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with success true when the walk through is updated', async () => {
        const req = { body: { user_id: 'u1', applicationWalkThrough: 1 } } as unknown as Request;
        updateAppWalkThroughServiceMock.mockResolvedValue({ nModified: 1 });

        await updateApplicationWalkThroughController.updateApplicationWalkThrough(req, res);
        await flushMicrotasks();

        expect(updateAppWalkThroughServiceMock).toHaveBeenCalledWith({
            user_id: 'u1',
            applicationWalkThrough: 1
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({ success: true });
    });

    it('returns 401 with the error message when the service throws', async () => {
        const req = { body: { user_id: 'u1', applicationWalkThrough: 1 } } as unknown as Request;
        updateAppWalkThroughServiceMock.mockRejectedValue(new Error('boom'));

        await updateApplicationWalkThroughController.updateApplicationWalkThrough(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: APPLICATION_WALK_THROUGH_ERROR_MESSAGE.UPDATE_APP_WALK_THROUGH_ERROR
        });
    });
});