import expertConsultationService from '../../../services/common/expertConsultationService';
import ExpertConsultation from '../../../model/expertConsultationModel';
import customerConsultationEmail from '../../../util/customerConsultationEmail';

jest.mock('../../../model/expertConsultationModel', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('../../../util/customerConsultationEmail', () => ({
    __esModule: true,
    default: { sendCustomerThankYouEmail: jest.fn(), sendAdminNotificationEmail: jest.fn() }
}));

const ExpertConsultationMock = ExpertConsultation as unknown as jest.Mock;
const sendCustomerThankYouEmailMock = (customerConsultationEmail as unknown as { sendCustomerThankYouEmail: jest.Mock }).sendCustomerThankYouEmail;
const sendAdminNotificationEmailMock = (customerConsultationEmail as unknown as { sendAdminNotificationEmail: jest.Mock }).sendAdminNotificationEmail;

describe('expertConsultationService', () => {
    beforeEach(() => {
        ExpertConsultationMock.mockReset();
        sendCustomerThankYouEmailMock.mockReset();
        sendAdminNotificationEmailMock.mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates the consultation and sends both emails on success', async () => {
        const saveMock = jest.fn().mockResolvedValue(undefined);
        ExpertConsultationMock.mockImplementation(() => ({ save: saveMock }));
        sendCustomerThankYouEmailMock.mockResolvedValue(undefined);
        sendAdminNotificationEmailMock.mockResolvedValue(undefined);

        const result = await expertConsultationService.ExpertConsultationService('John Doe', 'john@example.com', '1234567890', 'Acme', '$10k', '3 months');

        expect(ExpertConsultationMock).toHaveBeenCalledWith({
            fullName: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '1234567890',
            company: 'Acme',
            projectBudget: '$10k',
            timeline: '3 months'
        });
        expect(saveMock).toHaveBeenCalled();
        expect(sendCustomerThankYouEmailMock).toHaveBeenCalled();
        expect(sendAdminNotificationEmailMock).toHaveBeenCalled();
        expect(result).toEqual({ save: saveMock });
    });

    it('throws an error when saving the consultation fails', async () => {
        ExpertConsultationMock.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('save failed')) }));

        await expect(
            expertConsultationService.ExpertConsultationService('John', 'j@example.com', '1', '', '', '')
        ).rejects.toThrow('Error creating expert consultation: Error: save failed');
    });

    it('throws an error when sending the customer email fails', async () => {
        ExpertConsultationMock.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(undefined) }));
        sendCustomerThankYouEmailMock.mockRejectedValue(new Error('email failed'));

        await expect(
            expertConsultationService.ExpertConsultationService('John', 'j@example.com', '1', '', '', '')
        ).rejects.toThrow('Error creating expert consultation: Error: email failed');
    });
});