import getAllOrganizationsBySuperadminService from '../../../services/superadmin/getAllOrganizationsBySuperadminService';
import Organization from '../../../model/organization';

jest.mock('../../../model/organization', () => {
    const Organization = jest.fn();
    (Organization as any).find = jest.fn();
    return { __esModule: true, default: Organization };
});

const OrganizationMock = Organization as unknown as jest.Mock & { find: jest.Mock };

describe('getAllOrganizationsBySuperadminService', () => {
    beforeEach(() => {
        OrganizationMock.mockReset();
        OrganizationMock.find = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns all organizations on success', async () => {
        const organizations = [
            { _id: 'org1', name: 'Org One' },
            { _id: 'org2', name: 'Org Two' }
        ];
        OrganizationMock.find.mockResolvedValue(organizations);

        const result = await getAllOrganizationsBySuperadminService.getAllOrganizationsBySuperadmin();

        expect(OrganizationMock.find).toHaveBeenCalledWith({});
        expect(result).toEqual(organizations);
    });

    it('returns an empty array when no organizations exist', async () => {
        OrganizationMock.find.mockResolvedValue([]);

        const result = await getAllOrganizationsBySuperadminService.getAllOrganizationsBySuperadmin();

        expect(OrganizationMock.find).toHaveBeenCalledWith({});
        expect(result).toEqual([]);
    });

    it('propagates the error when the query fails', async () => {
        OrganizationMock.find.mockRejectedValue(new Error('DB error'));

        await expect(getAllOrganizationsBySuperadminService.getAllOrganizationsBySuperadmin())
            .rejects.toThrow('DB error');
    });
});
