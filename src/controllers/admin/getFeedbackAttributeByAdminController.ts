import { Request, Response } from 'express';
import getFeedbackAttributes from '../../services/admin/getFeedbackAttributeByAdminService';
import { FEEDBACK_ATTRIBUTE_ERROR_MESSAGES, FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants/admin/feedbackAttributeMessages';

const getFeedbackAttributeByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const feedbackAttributeDetails = await getFeedbackAttributes.getFeedbackAttributeByAdminService(id);
        if (!feedbackAttributeDetails) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE });
        }
        return res.status(HTTP_STATUS.OK).json({ success: true, message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_SUCCESS_MESSAGE, data: feedbackAttributeDetails });
    } catch (error: any) {
        console.error(`Error in fetching feedback attribute details: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_FETCH_ERROR_MESSAGE });
    }
}

export default { getFeedbackAttributeByAdminController };
