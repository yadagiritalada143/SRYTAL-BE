import { Request, Response } from 'express';
import getAllOrganisationsBySuperadminController from '../../../controllers/superadmin/getAllOrganisationsBySuperadminController';
import getAllOrganisationsBySuperadminService from '../../../services/superadmin/getAllOrganizationsBySuperadminService';

jest.mock('../../../services/superadmin/getAllOrganizationsBySuperadminService', () => ({
    __esModule: true,
    default: {
        getAllOrganizationsBySuperadmin: jest.fn()
    }
}));

const getAllOrganizationsBySuperadminMock =
    getAllOrganisationsBySuperadminService.getAllOrganizationsBySuperadmin as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getAllOrganisationsBySuperadminController', () => {
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
        getAllOrganizationsBySuperadminMock.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAllOrganizationsBySuperadmin', () => {
        it('returns 200 with organizations on success', async () => {
            const organizations = [
                { _id: 'org1', name: 'Org One' },
                { _id: 'org2', name: 'Org Two' }
            ];
            getAllOrganizationsBySuperadminMock.mockResolvedValue(organizations);

            await getAllOrganisationsBySuperadminController.getAllOrganizationsBySuperadmin({} as Request, res);
            await flushMicrotasks();

            expect(getAllOrganizationsBySuperadminMock).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ organizations });
        });

        it('returns 500 when the service throws', async () => {
            getAllOrganizationsBySuperadminMock.mockRejectedValue(new Error('DB error'));

            await getAllOrganisationsBySuperadminController.getAllOrganizationsBySuperadmin({} as Request, res);
            await flushMicrotasks();

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Error in fetching get organisations by super admin !'
            });
        });
    });
});
