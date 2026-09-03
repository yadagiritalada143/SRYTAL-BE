import ExpertConsultation from '../../model/expertConsultationModel';
import { IExpertConsultation } from '../../interfaces/expertConsultation';
import customerConsultationEmail from '../../util/customerConsultationEmail';

const ExpertConsultationService = async (consultationData: IExpertConsultation) => {
    try {
        const consultation = new ExpertConsultation(consultationData);
        await consultation.save();

        await Promise.all([
            customerConsultationEmail.sendCustomerThankYouEmail(consultationData),
            customerConsultationEmail.sendAdminNotificationEmail(consultationData),
        ]);

        return consultation;
    } catch (error) {
        throw new Error(`Error creating expert consultation: ${error}`);
    }
};

export default { ExpertConsultationService };