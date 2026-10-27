import { Request, Response } from 'express';
import addBloodgroupByAdminController from '../../../controllers/admin/addBloodGroupByAdminController';
import addBloodgroupByAdminService from '../../../services/admin/addBloodGroupByAdminService';
import {
    BLOOD_GROUP_SUCCESS_MESSAGES,
    BLOOD_GROUP_ERROR_MESSAGES
} from '../../../constants/admin/bloodgroupMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/addBloodGroupByAdminService', () => ({
    __esModule: true,
    default: {
        addBloodgroupByAdmin: jest.fn()
    }
}));

const addBloodgroupByAdminServiceMock = addBloodgroupByAdminService.addBloodgroupByAdmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('addNewBloodgroupByAdmin controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        addBloodgroupByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 201 with the success message when the blood group is saved with an id', async () => {
        const req = { body: { type: 'O+' } } as unknown as Request;
        addBloodgroupByAdminServiceMock.mockResolvedValue({ id: 'bg123', type: 'O+' });

        await addBloodgroupByAdminController.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();

        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith('O+');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: BLOOD_GROUP_SUCCESS_MESSAGES.BLOOD_GROUP_ADD_SUCCESS_MESSAGE
        });
    });

    it('returns 400 with the error message when the saved blood group has no id', async () => {
        const req = { body: { type: 'O+' } } as unknown as Request;
        addBloodgroupByAdminServiceMock.mockResolvedValue({ success: false });

        await addBloodgroupByAdminController.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();

        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith('O+');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_ADD_ERROR_MESSAGE
        });
    });

    it('passes an undefined type through when the body does not contain one', async () => {
        const req = { body: {} } as unknown as Request;
        addBloodgroupByAdminServiceMock.mockResolvedValue({ id: 'bg123' });

        await addBloodgroupByAdminController.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();

        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    });

    it('returns 500 with the unexpected error message when the service throws', async () => {
        const req = { body: { type: 'O+' } } as unknown as Request;
        addBloodgroupByAdminServiceMock.mockRejectedValue(new Error('Service failure'));

        await addBloodgroupByAdminController.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();

        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith('O+');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            message: BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_UNEXPECTED_ERROR_MESSAGE
        });
    });
});