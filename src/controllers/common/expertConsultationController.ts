import { Request, Response } from 'express';
import createExpertConsultationService from '../../services/common/expertConsultationService';

const createExpertConsultation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, phoneNumber, company, projectBudget, timeline } = req.body;
        const consultation = await createExpertConsultationService.ExpertConsultationService({
            fullName, email, phoneNumber, company, projectBudget, timeline
        });

        res.status(201).json({
            success: true,
            message: 'Expert consultation request submitted successfully',
            data: consultation
        });

    } catch (error) {
        console.error('Create Expert Consultation Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit expert consultation request' });
    }
};

export default { createExpertConsultation };