"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllOrganizationsBySuperadminService_1 = __importDefault(require("../../../services/superadmin/getAllOrganizationsBySuperadminService"));
const organization_1 = __importDefault(require("../../../model/organization"));
jest.mock('../../../model/organization', () => {
    const Organization = jest.fn();
    Organization.find = jest.fn();
    return { __esModule: true, default: Organization };
});
const OrganizationMock = organization_1.default;
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
        const result = await getAllOrganizationsBySuperadminService_1.default.getAllOrganizationsBySuperadmin();
        expect(OrganizationMock.find).toHaveBeenCalledWith({});
        expect(result).toEqual(organizations);
    });
    it('returns an empty array when no organizations exist', async () => {
        OrganizationMock.find.mockResolvedValue([]);
        const result = await getAllOrganizationsBySuperadminService_1.default.getAllOrganizationsBySuperadmin();
        expect(OrganizationMock.find).toHaveBeenCalledWith({});
        expect(result).toEqual([]);
    });
    it('propagates the error when the query fails', async () => {
        OrganizationMock.find.mockRejectedValue(new Error('DB error'));
        await expect(getAllOrganizationsBySuperadminService_1.default.getAllOrganizationsBySuperadmin())
            .rejects.toThrow('DB error');
    });
});
