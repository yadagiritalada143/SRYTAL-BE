"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllOrganisationsBySuperadminController_1 = __importDefault(require("../../../controllers/superadmin/getAllOrganisationsBySuperadminController"));
const getAllOrganizationsBySuperadminService_1 = __importDefault(require("../../../services/superadmin/getAllOrganizationsBySuperadminService"));
jest.mock('../../../services/superadmin/getAllOrganizationsBySuperadminService', () => ({
    __esModule: true,
    default: {
        getAllOrganizationsBySuperadmin: jest.fn()
    }
}));
const getAllOrganizationsBySuperadminMock = getAllOrganizationsBySuperadminService_1.default.getAllOrganizationsBySuperadmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getAllOrganisationsBySuperadminController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = {
            status: mockStatus,
            json: mockJson
        };
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
            await getAllOrganisationsBySuperadminController_1.default.getAllOrganizationsBySuperadmin({}, res);
            await flushMicrotasks();
            expect(getAllOrganizationsBySuperadminMock).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ organizations });
        });
        it('returns 500 when the service throws', async () => {
            getAllOrganizationsBySuperadminMock.mockRejectedValue(new Error('DB error'));
            await getAllOrganisationsBySuperadminController_1.default.getAllOrganizationsBySuperadmin({}, res);
            await flushMicrotasks();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Error in fetching get organisations by super admin !'
            });
        });
    });
});
