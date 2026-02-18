import { Request, Response } from 'express';
import deleteFeedbackAttribute from '../../services/admin/deleteFeedbackAttributeByAdminService';
import { FEEDBACK_ATTRIBUTE_ERROR_MESSAGES, FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES, HTTP_STATUS } from '../../constants/admin/feedbackattributeMessages';

const deleteFeedbackAttributeByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = req.params.id;
        const deleteResult = await deleteFeedbackAttribute.deleteFeedbackAttributeByAdminService(id);

        if (deleteResult.success) {
            return res.status(HTTP_STATUS.OK).json({ success: true, message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_SUCCESS_MESSAGE, data: deleteResult });
        } else {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE });
        }
    } catch (error: any) {
        console.error(`Error in deleting feedback attribute: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_DELETE_ERROR_MESSAGE });
    }
};

export default { deleteFeedbackAttributeByAdminController };
