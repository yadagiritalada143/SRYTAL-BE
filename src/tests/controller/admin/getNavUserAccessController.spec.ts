import { Request, Response } from 'express';
import getNavUserAccessController from '../../../controllers/admin/getNavUserAccessController';
import getNavUserAccessService from '../../../services/admin/getNavUserAccessService';
import { NAV_ERROR_MESSAGES } from '../../../constants/navigation/navMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getNavUserAccessService', () => ({
    __esModule: true,
    default: {
        getNavUserAccess: jest.fn()
    }
}));

const getNavUserAccessServiceMock = getNavUserAccessService.getNavUserAccess as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getNavUserAccess controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getNavUserAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the user access when the service resolves', async () => {
        const req = {
            params: { userId: 'u1' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        const result = { success: true, userId: 'u1', roleKeys: ['k1'], addedKeys: [], removedKeys: [] };
        getNavUserAccessServiceMock.mockResolvedValue(result);

        await getNavUserAccessController.getNavUserAccess(req, res);
        await flushMicrotasks();

        expect(getNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavUserAccessServiceMock).toHaveBeenCalledWith('org1', 'u1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(result);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            params: { userId: 'u1' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        getNavUserAccessServiceMock.mockRejectedValue(new Error('Service failure'));

        await getNavUserAccessController.getNavUserAccess(req, res);
        await flushMicrotasks();

        expect(getNavUserAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: NAV_ERROR_MESSAGES.USER_ACCESS_FETCH_ERROR
        });
    });
});