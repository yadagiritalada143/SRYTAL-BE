import { Request, Response } from 'express';
import updateNavUserAccessController from '../../../controllers/admin/updateNavUserAccessController';
import updateNavUserAccessService from '../../../services/admin/updateNavUserAccessService';
import { NAV_ERROR_MESSAGES, NAV_SUCCESS_MESSAGES } from '../../../constants/navigation/navMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateNavUserAccessService', () => ({
    __esModule: true,
    default: {
        updateNavUserAccess: jest.fn()
    }
}));

const updateNavUserAccessServiceMock = updateNavUserAccessService.updateNavUserAccess as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateNavUserAccess controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateNavUserAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when the userId is missing', async () => {
        const req = { body: { addedKeys: ['a1'] } } as unknown as Request;

        await updateNavUserAccessController.updateNavUserAccess(req, res);

        expect(updateNavUserAccessServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'userId is required' });
    });

    it('returns 200 with the success message when the service resolves', async () => {
        const req = {
            body: { userId: 'u1', addedKeys: ['a1'], removedKeys: ['r1'] },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        const result = { success: true, userAccess: { _id: 'ua1' } };
        updateNavUserAccessServiceMock.mockResolvedValue(result);

        await updateNavUserAccessController.updateNavUserAccess(req, res);
        await flushMicrotasks();

        expect(updateNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledWith('org1', 'u1', ['a1'], ['r1']);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ ...result, message: NAV_SUCCESS_MESSAGES.USER_ACCESS_UPDATED });
    });

    it('passes empty arrays when the key arrays are missing', async () => {
        const req = {
            body: { userId: 'u1' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        updateNavUserAccessServiceMock.mockResolvedValue({ success: true });

        await updateNavUserAccessController.updateNavUserAccess(req, res);
        await flushMicrotasks();

        expect(updateNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavUserAccessServiceMock).toHaveBeenCalledWith('org1', 'u1', [], []);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            body: { userId: 'u1', addedKeys: ['a1'], removedKeys: ['r1'] },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        updateNavUserAccessServiceMock.mockRejectedValue(new Error('Service failure'));

        await updateNavUserAccessController.updateNavUserAccess(req, res);
        await flushMicrotasks();

        expect(updateNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: NAV_ERROR_MESSAGES.USER_ACCESS_UPDATE_ERROR
        });
    });
});