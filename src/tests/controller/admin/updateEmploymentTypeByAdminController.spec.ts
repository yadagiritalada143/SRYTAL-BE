import { Request, Response } from 'express';
import updateEmploymentTypeByAdminController from '../../../controllers/admin/updateEmploymentTypeByAdminController';
import updateEmploymentTypeByAdminService from '../../../services/admin/updateEmploymentTypeByAdminService';
import { EMPLOYMENT_TYPE_ERRORS_MESSAGES } from '../../../constants/admin/employementTypesMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        updateEmploymentTypeByAdmin: jest.fn()
    }
}));

const updateEmploymentTypeByAdminServiceMock =
    updateEmploymentTypeByAdminService.updateEmploymentTypeByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('updateEmploymentType controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateEmploymentTypeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the update response when the service resolves', async () => {
        const req = { body: { id: 'et1', employmentType: 'Contract' } } as unknown as Request;
        const updateResponse = { success: true, responseAfterUpdate: { modifiedCount: 1 } };
        updateEmploymentTypeByAdminServiceMock.mockResolvedValue(updateResponse);

        await updateEmploymentTypeByAdminController.updateEmploymentType(req, res);
        await flushMicrotasks();

        expect(updateEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(updateEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('et1', 'Contract');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(updateResponse);
    });

    it('returns 500 with the error message when the service rejects', async () => {
        const req = { body: { id: 'et1', employmentType: 'Contract' } } as unknown as Request;
        updateEmploymentTypeByAdminServiceMock.mockRejectedValue({ success: false });

        await updateEmploymentTypeByAdminController.updateEmploymentType(req, res);
        await flushMicrotasks();

        expect(updateEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UPDATING_ERROR_MESSAGE
        });
    });
});