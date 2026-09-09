import { Request, Response } from 'express';
import createExpertConsultationService from '../../services/common/expertConsultationService';
import { EXPERT_CONSULTATION_SUCCESS_MESSAGE, EXPERT_CONSULTATION_ERROR_MESSAGE } from '../../constants/common/expertConsultationMessage';

const createExpertConsultation = async (req: Request, res: Response) => {
    try {
        const { fullName, email, phoneNumber, company, projectBudget, timeline } = req.body;

        const consultation =
            await createExpertConsultationService.ExpertConsultationService(
                fullName,
                email,
                phoneNumber,
                company,
                projectBudget,
                timeline
            );

        res.status(201).json({
            success: true,
            message: EXPERT_CONSULTATION_SUCCESS_MESSAGE.SUBMITTED_SUCCESSFULLY,
            data: consultation,
        });
    } catch (error) {
        console.error(`Create Expert Consultation Error: ${error}`);

        res.status(500).json({
            success: false,
            message: EXPERT_CONSULTATION_ERROR_MESSAGE.SUBMISSION_FAILED,
        });
    }
};

export default { createExpertConsultation };
