"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCompanyByRecruiterService_1 = __importDefault(require("../../../services/recruiter/updateCompanyByRecruiterService"));
const poolCompanies_1 = __importDefault(require("../../../model/poolCompanies"));
jest.mock('../../../model/poolCompanies', () => ({
    __esModule: true,
    default: { updateOne: jest.fn() }
}));
const updateOneMock = poolCompanies_1.default.updateOne;
describe('updateCompanyByRecruiterService', () => {
    beforeEach(() => {
        updateOneMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns { success: true } when the company update is acknowledged', async () => {
        updateOneMock.mockResolvedValue({ acknowledged: true });
        const result = await updateCompanyByRecruiterService_1.default.updatePoolCompanyDetails({
            id: 'c1',
            companyName: 'Acme'
        });
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'c1' }, { id: 'c1', companyName: 'Acme', lastUpdatedAt: expect.any(Date) });
        expect(result).toEqual({ success: true });
    });
    it('returns { success: false } when the company update is not acknowledged', async () => {
        updateOneMock.mockResolvedValue({ acknowledged: false });
        const result = await updateCompanyByRecruiterService_1.default.updatePoolCompanyDetails({
            id: 'c1',
            companyName: 'Acme'
        });
        expect(result).toEqual({ success: false });
    });
    it('returns { success: false } when the update throws', async () => {
        updateOneMock.mockRejectedValue(new Error('Update failed'));
        const result = await updateCompanyByRecruiterService_1.default.updatePoolCompanyDetails({
            id: 'c1',
            companyName: 'Acme'
        });
        expect(result).toEqual({ success: false });
    });
});
