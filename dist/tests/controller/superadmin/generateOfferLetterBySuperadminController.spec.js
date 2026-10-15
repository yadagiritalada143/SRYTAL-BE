"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateOfferLetterBySuperadminController_1 = __importDefault(require("../../../controllers/superadmin/generateOfferLetterBySuperadminController"));
const generateOfferLetterBySuperadminService_1 = __importDefault(require("../../../services/superadmin/generateOfferLetterBySuperadminService"));
jest.mock('../../../services/superadmin/generateOfferLetterBySuperadminService', () => ({
    __esModule: true,
    default: {
        generateOfferLetterBySuperadmin: jest.fn()
    }
}));
const generateOfferLetterBySuperadminMock = generateOfferLetterBySuperadminService_1.default.generateOfferLetterBySuperadmin;
describe('generateOfferLetterBySuperadminController', () => {
    let mockJson;
    let mockStatus;
    let mockSetHeader;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockSetHeader = jest.fn();
        res = {
            status: mockStatus,
            json: mockJson,
            setHeader: mockSetHeader
        };
        generateOfferLetterBySuperadminMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('generateOfferLetterBySuperadmin', () => {
        it('calls the service with all body fields on success', async () => {
            const req = {
                body: {
                    nameOfTheCandidate: 'John Doe',
                    subject: 'Offer Letter',
                    role: 'Software Engineer',
                    dateOfJoining: '2026-01-01',
                    compensation: '1000000',
                    workLocation: 'Bangalore'
                }
            };
            generateOfferLetterBySuperadminMock.mockResolvedValue(undefined);
            await generateOfferLetterBySuperadminController_1.default.generateOfferLetterBySuperadmin(req, res);
            expect(generateOfferLetterBySuperadminMock).toHaveBeenCalledWith(res, 'John Doe', 'Offer Letter', 'Software Engineer', '2026-01-01', '1000000', 'Bangalore');
        });
        it('returns 400 when any required field is missing', async () => {
            const req = {
                body: {
                    nameOfTheCandidate: 'John Doe',
                    subject: 'Offer Letter',
                    role: 'Software Engineer',
                    dateOfJoining: '',
                    compensation: '1000000',
                    workLocation: 'Bangalore'
                }
            };
            await generateOfferLetterBySuperadminController_1.default.generateOfferLetterBySuperadmin(req, res);
            expect(generateOfferLetterBySuperadminMock).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'All fields are required.' });
        });
        it('returns 400 when all fields are missing', async () => {
            const req = { body: {} };
            await generateOfferLetterBySuperadminController_1.default.generateOfferLetterBySuperadmin(req, res);
            expect(generateOfferLetterBySuperadminMock).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'All fields are required.' });
        });
        it('returns 500 when the service throws', async () => {
            const req = {
                body: {
                    nameOfTheCandidate: 'John Doe',
                    subject: 'Offer Letter',
                    role: 'Software Engineer',
                    dateOfJoining: '2026-01-01',
                    compensation: '1000000',
                    workLocation: 'Bangalore'
                }
            };
            generateOfferLetterBySuperadminMock.mockRejectedValue(new Error('PDF generation failed'));
            await generateOfferLetterBySuperadminController_1.default.generateOfferLetterBySuperadmin(req, res);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Error generating offer letter by superadmin.' });
        });
    });
});
