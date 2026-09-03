import ExpertConsultation from '../../model/expertConsultationModel';
import { IExpertConsultation } from '../../interfaces/expertConsultation';
import customerConsultationEmail from '../../util/customerConsultationEmail';

const ExpertConsultationService = async (fullName: string, email: string, phoneNumber: string, company: string, projectBudget: string, timeline: string): Promise<IExpertConsultation> => {
    try {
        const consultation = new ExpertConsultation({ fullName, email, phoneNumber, company, projectBudget, timeline });
        await consultation.save();

        await Promise.all([
            customerConsultationEmail.sendCustomerThankYouEmail(consultation),
            customerConsultationEmail.sendAdminNotificationEmail(consultation),
        ]);

        return consultation;
    } catch (error) {
        throw new Error(`Error creating expert consultation: ${error}`);
    }
};

export default { ExpertConsultationService };
