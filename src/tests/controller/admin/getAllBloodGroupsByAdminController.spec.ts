import { Request, Response } from 'express';
import getAllBloodGroupsByAdminController from '../../../controllers/admin/getAllBloodGroupsByAdminController';
import getAllBloodGroupsByAdminService from '../../../services/admin/getAllBloodGroupsByAdminService';
import { BLOOD_GROUP_ERROR_MESSAGES } from '../../../constants/admin/bloodgroupMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getAllBloodGroupsByAdminService', () => ({
    __esModule: true,
    default: {
        getAllBloodgroupsByAdmin: jest.fn()
    }
}));

const getAllBloodgroupsByAdminServiceMock =
    getAllBloodGroupsByAdminService.getAllBloodgroupsByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getAllBloodGroupsDetails controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllBloodgroupsByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the fetched blood group response when the service resolves', async () => {
        const req = {} as unknown as Request;
        const fetchResponse = { success: true, bloodGroupList: [{ _id: 'bg1', type: 'O+' }] };
        getAllBloodgroupsByAdminServiceMock.mockResolvedValue(fetchResponse);

        await getAllBloodGroupsByAdminController.getAllBloodGroupsDetails(req, res);
        await flushMicrotasks();

        expect(getAllBloodgroupsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {} as unknown as Request;
        getAllBloodgroupsByAdminServiceMock.mockRejectedValue({ success: false });

        await getAllBloodGroupsByAdminController.getAllBloodGroupsDetails(req, res);
        await flushMicrotasks();

        expect(getAllBloodgroupsByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_FETCH_ERROR_MESSAGES
        });
    });
});