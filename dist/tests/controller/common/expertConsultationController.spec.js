"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expertConsultationController_1 = __importDefault(require("../../../controllers/common/expertConsultationController"));
const expertConsultationService_1 = __importDefault(require("../../../services/common/expertConsultationService"));
const expertConsultationMessage_1 = require("../../../constants/common/expertConsultationMessage");
jest.mock('../../../services/common/expertConsultationService', () => ({
    __esModule: true,
    default: { ExpertConsultationService: jest.fn() }
}));
const ExpertConsultationServiceMock = expertConsultationService_1.default.ExpertConsultationService;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('expertConsultationController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        ExpertConsultationServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 201 with the success message and the created consultation', async () => {
        const req = {
            body: {
                fullName: 'John Doe',
                email: 'john@example.com',
                phoneNumber: '1234567890',
                company: 'Acme',
                projectBudget: '$10k',
                timeline: '3 months'
            }
        };
        const consultation = { _id: 'c1', fullName: 'John Doe' };
        ExpertConsultationServiceMock.mockResolvedValue(consultation);
        await expertConsultationController_1.default.createExpertConsultation(req, res);
        await flushMicrotasks();
        expect(ExpertConsultationServiceMock).toHaveBeenCalledWith('John Doe', 'john@example.com', '1234567890', 'Acme', '$10k', '3 months');
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: expertConsultationMessage_1.EXPERT_CONSULTATION_SUCCESS_MESSAGE.SUBMITTED_SUCCESSFULLY,
            data: consultation
        });
    });
    it('returns 500 with the failure message when the service throws', async () => {
        const req = { body: {} };
        ExpertConsultationServiceMock.mockRejectedValue(new Error('boom'));
        await expertConsultationController_1.default.createExpertConsultation(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: expertConsultationMessage_1.EXPERT_CONSULTATION_ERROR_MESSAGE.SUBMISSION_FAILED
        });
    });
});
