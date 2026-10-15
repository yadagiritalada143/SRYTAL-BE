import { Request, Response } from 'express';
import expertConsultationController from '../../../controllers/common/expertConsultationController';
import createExpertConsultationService from '../../../services/common/expertConsultationService';
import {
    EXPERT_CONSULTATION_SUCCESS_MESSAGE,
    EXPERT_CONSULTATION_ERROR_MESSAGE
} from '../../../constants/common/expertConsultationMessage';

jest.mock('../../../services/common/expertConsultationService', () => ({
    __esModule: true,
    default: { ExpertConsultationService: jest.fn() }
}));

const ExpertConsultationServiceMock = createExpertConsultationService.ExpertConsultationService as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('expertConsultationController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        ExpertConsultationServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
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
        } as unknown as Request;
        const consultation = { _id: 'c1', fullName: 'John Doe' };
        ExpertConsultationServiceMock.mockResolvedValue(consultation);

        await expertConsultationController.createExpertConsultation(req, res);
        await flushMicrotasks();

        expect(ExpertConsultationServiceMock).toHaveBeenCalledWith(
            'John Doe',
            'john@example.com',
            '1234567890',
            'Acme',
            '$10k',
            '3 months'
        );
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: EXPERT_CONSULTATION_SUCCESS_MESSAGE.SUBMITTED_SUCCESSFULLY,
            data: consultation
        });
    });

    it('returns 500 with the failure message when the service throws', async () => {
        const req = { body: {} } as unknown as Request;
        ExpertConsultationServiceMock.mockRejectedValue(new Error('boom'));

        await expertConsultationController.createExpertConsultation(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: EXPERT_CONSULTATION_ERROR_MESSAGE.SUBMISSION_FAILED
        });
    });
});