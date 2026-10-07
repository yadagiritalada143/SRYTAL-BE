import { Request, Response } from 'express';
import getAllEmployeesBySuperadminController from '../../../controllers/superadmin/getAllEmployeesBySuperadminController';
import allEmployeesBySuperadminServices from '../../../services/superadmin/getAllEmployeesBySuperadminService';
import { SUPERADMIN_ERROR } from '../../../constants/superadmin/superadminErrorMessage';

jest.mock('../../../services/superadmin/getAllEmployeesBySuperadminService', () => ({
    __esModule: true,
    default: {
        getAllEmployeesBySuperadmin: jest.fn()
    }
}));

const getAllEmployeesBySuperadminMock =
    allEmployeesBySuperadminServices.getAllEmployeesBySuperadmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getAllEmployeesBySuperadminController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = {
            status: mockStatus,
            json: mockJson
        } as unknown as Response;
        getAllEmployeesBySuperadminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAllEmployeesBySuperadmin', () => {
        it('returns 200 with employee list on success', async () => {
            const req = { params: { organizationId: 'org1' } } as unknown as Request;
            const employees = {
                success: true,
                superadminEmployeeList: [
                    { _id: 'u1', firstName: 'John', lastName: 'Doe' }
                ]
            };
            getAllEmployeesBySuperadminMock.mockResolvedValue(employees);

            await getAllEmployeesBySuperadminController.getAllEmployeesBySuperadmin(req, res);
            await flushMicrotasks();

            expect(getAllEmployeesBySuperadminMock).toHaveBeenCalledWith('org1');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(employees);
        });

        it('returns 500 when the service throws', async () => {
            const req = { params: { organizationId: 'org1' } } as unknown as Request;
            getAllEmployeesBySuperadminMock.mockRejectedValue({ success: false });

            await getAllEmployeesBySuperadminController.getAllEmployeesBySuperadmin(req, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: SUPERADMIN_ERROR.FETCHING_ALL_EMPLOYEE_DETAILS_ERROR
            });
        });
    });
});
