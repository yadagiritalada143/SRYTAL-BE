import { Request, Response } from 'express';
import updateNavRoleAccessController from '../../../controllers/admin/updateNavRoleAccessController';
import updateNavRoleAccessService from '../../../services/admin/updateNavRoleAccessService';
import { NAV_ERROR_MESSAGES, NAV_SUCCESS_MESSAGES } from '../../../constants/navigation/navMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateNavRoleAccessService', () => ({
    __esModule: true,
    default: {
        updateNavRoleAccess: jest.fn()
    }
}));

const updateNavRoleAccessServiceMock = updateNavRoleAccessService.updateNavRoleAccess as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateNavRoleAccess controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateNavRoleAccessServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when the role is missing', async () => {
        const req = { body: { navKeys: ['k1'] } } as unknown as Request;

        await updateNavRoleAccessController.updateNavRoleAccess(req, res);

        expect(updateNavRoleAccessServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({ success: false, message: 'role is required' });
    });

    it('returns 200 with the success message when the service resolves', async () => {
        const req = {
            body: { role: 'Admin', navKeys: ['k1'] },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        const result = { success: true, roleAccess: { _id: 'ra1' } };
        updateNavRoleAccessServiceMock.mockResolvedValue(result);

        await updateNavRoleAccessController.updateNavRoleAccess(req, res);
        await flushMicrotasks();

        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledWith('org1', 'Admin', ['k1']);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ ...result, message: NAV_SUCCESS_MESSAGES.ROLE_ACCESS_UPDATED });
    });

    it('passes an empty array when navKeys is missing', async () => {
        const req = {
            body: { role: 'Employee' },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        updateNavRoleAccessServiceMock.mockResolvedValue({ success: true });

        await updateNavRoleAccessController.updateNavRoleAccess(req, res);
        await flushMicrotasks();

        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledWith('org1', 'Employee', []);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {
            body: { role: 'Admin', navKeys: ['k1'] },
            user: { organizationId: 'org1' }
        } as unknown as Request;
        updateNavRoleAccessServiceMock.mockRejectedValue(new Error('Service failure'));

        await updateNavRoleAccessController.updateNavRoleAccess(req, res);
        await flushMicrotasks();

        expect(updateNavRoleAccessServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: NAV_ERROR_MESSAGES.ROLE_ACCESS_UPDATE_ERROR
        });
    });
});