import { Request, Response } from 'express';
import addFeedbackAttributes from '../../services/admin/addFeedbackAttributeByAdminService';
import {FEEDBACK_ATTRIBUTE_ERROR_MESSAGES, FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES, HTTP_STATUS, } from '../../constants/admin/feedBackattributeMessages';

const addFeedbackAttributeByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name } = req.body;
        await addFeedbackAttributes.addFeedbackAttributeByAdminService(name);
        return res.status(HTTP_STATUS.OK).json({success: true, message: FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_SUCCESS_MESSAGE });

    } catch ( error: any) {
        console.error(`Error while adding feedback attribute: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: FEEDBACK_ATTRIBUTE_ERROR_MESSAGES.FEEDBACK_ATTRIBUTE_ADD_ERROR_MESSAGE });
    }
};

export default { addFeedbackAttributeByAdminController };
