import { Request, Response } from 'express';
import getAllEmploymentTypesByAdminController from '../../../controllers/admin/getAllEmploymentTypesByAdminController';
import getAllEmploymentTypeByAdminService from '../../../services/admin/getAllEmploymentTypeByAdminService';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES } from '../../../constants/admin/employementTypesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getAllEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        getAllEmploymentTypesByAdmin: jest.fn()
    }
}));

const getAllEmploymentTypesByAdminServiceMock =
    getAllEmploymentTypeByAdminService.getAllEmploymentTypesByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getAllEmploymentTypesByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllEmploymentTypesByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the fetched employment types response when the service resolves', async () => {
        const req = {} as unknown as Request;
        const fetchResponse = { success: true, employmentTypesList: [{ _id: 'et1', employmentType: 'Full-Time' }] };
        getAllEmploymentTypesByAdminServiceMock.mockResolvedValue(fetchResponse);

        await getAllEmploymentTypesByAdminController.getAllEmploymentTypesByAdmin(req, res);
        await flushMicrotasks();

        expect(getAllEmploymentTypesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(fetchResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = {} as unknown as Request;
        getAllEmploymentTypesByAdminServiceMock.mockRejectedValue({ success: false });

        await getAllEmploymentTypesByAdminController.getAllEmploymentTypesByAdmin(req, res);
        await flushMicrotasks();

        expect(getAllEmploymentTypesByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_FETCH_ERROR_MESSAGES
        });
    });
});