import { Request, Response } from 'express';
import getFeedbackAttributes from '../../services/admin/getAllFeedbackAttributeByAdminService';
import { FEEDBACK_ATTRIBUTE_ERROR_MESSAGES, FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants/admin/feedbackattributeMessages';

const getAllFeedbackAttributesByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const feedbackAttributes = await getFeedbackAttributes.getAllFeedbackAttributeByAdminService();
        return res.status(HTTP_STATUS.OK).json({ success: true, message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_SUCCESS_MESSAGE, data: feedbackAttributes });
    } catch (error: any) {
        console.error(`Error fetching feedback attributes: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FETCH_ALL_FEEDBACK_ATTRIBUTES_ERROR_MESSAGE });
    }
};

export default { getAllFeedbackAttributesByAdminController };
