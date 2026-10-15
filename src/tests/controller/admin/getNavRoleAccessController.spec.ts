import { Request, Response } from 'express';
import getNavRoleAccessController from '../../../controllers/admin/getNavRoleAccessController';
import getNavRoleAccessService from '../../../services/admin/getNavRoleAccessService';
import { NAV_ERROR_MESSAGES } from '../../../constants/navigation/navMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getNavRoleAccessService', () => ({
    __esModule: true,
    default: {
        getNavRoleAccess: jest.fn()
    }
}));

const getNavRoleAccessServiceMock = getNavRoleAccessService.getNavRoleAccess as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getNavRoleAccess controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getNavRoleAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the role access when the service resolves', async () => {
        const req = {
            params: { role: 'Admin' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        const result = { success: true, role: 'Admin', navKeys: ['k1'], isDefault: false };
        getNavRoleAccessServiceMock.mockResolvedValue(result);

        await getNavRoleAccessController.getNavRoleAccess(req, res);
        await flushMicrotasks();

        expect(getNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(getNavRoleAccessServiceMock).toHaveBeenCalledWith('org1', 'Admin');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(result);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            params: { role: 'Admin' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        getNavRoleAccessServiceMock.mockRejectedValue(new Error('Service failure'));

        await getNavRoleAccessController.getNavRoleAccess(req, res);
        await flushMicrotasks();

        expect(getNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: NAV_ERROR_MESSAGES.ROLE_ACCESS_FETCH_ERROR
        });
    });
});