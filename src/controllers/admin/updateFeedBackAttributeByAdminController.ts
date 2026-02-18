import { Request, Response } from 'express';
import updateFeedbackAttributeByAdminService from '../../services/admin/updateFeedbackAttributeByAdminService';
import { FEEDBACK_ATTRIBUTE_ERROR_MESSAGES, FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants/admin/feedBackattributeMessages';

const updateFeedbackAttributeByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id, name } = req.body;
        await updateFeedbackAttributeByAdminService.updateFeedbackAttributeByAdminService(id, name);
        return res.status(HTTP_STATUS.OK).json({ success: true, message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_SUCCESS_MESSAGE });

    } catch (error: any) {
        console.error(`Error updating feedback attribute: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_UPDATE_ERROR_MESSAGE });
    }
} 

export default { updateFeedbackAttributeByAdminController };
