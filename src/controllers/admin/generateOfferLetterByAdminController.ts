import { request, response } from 'express';
import generateOfferLetter from '../../services/admin/generateOfferLetterByAdminService';
import { OFFER_LETTER_MESSAGE, OFFER_LETTER_ERROR_MESSAGES, HTTP_STATUS } from '../../constants/admin/offerLetterMessage';

const generateOfferLetterByAdmin = async (req: typeof request, res: typeof response) => {
    try {

        const result = await generateOfferLetter.generateOfferLetterByAdminService(req.body);

        if (!result.success) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: OFFER_LETTER_ERROR_MESSAGES.OFFER_LETTER_GENERATION_FAILED, error: result.error });
        }

        return res
            .status(HTTP_STATUS.OK).json({ success: true, message: OFFER_LETTER_MESSAGE.OFFER_LETTER_GENERATED_SUCCESS, fileName: result.fileName })
            .set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${result.fileName || 'Offer-Letter.pdf' }`,
            })
            .send(result.pdfBuffer);
    }
    catch (error) {
        console.error(`Error generating offer letter: ${error}`);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: OFFER_LETTER_ERROR_MESSAGES.OFFER_LETTER_GENERATION_FAILED });
    }
};

export default { generateOfferLetterByAdmin };
