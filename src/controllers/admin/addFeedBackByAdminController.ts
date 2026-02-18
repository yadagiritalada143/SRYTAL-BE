import { Request, Response } from 'express';
import addFeedback from '../../services/admin/addFeedbackByAdminService';
import {FEEDBACK_MESSAGES, FEEDBACK_ERROR_MESSAGES, HTTP_STATUS} from '../../constants/admin/feedBackMessages';

const addFeedBackByAdminController = async (req: Request, res: Response): Promise<Response> => {
    try {
      
        const { name } = req.body;
        await addFeedback.addFeedbackByAdminService(name);
        return res.status(HTTP_STATUS.OK).json({success: true, message: FEEDBACK_MESSAGES.FEEDBACK_ADD_SUCCESS_MESSAGE });

    } catch ( error: any) {
        console.error(`Error while adding feedback: ${error}`);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: FEEDBACK_ERROR_MESSAGES.FEEDBACK_ADD_ERROR_MESSAGE });
    }
};

export default { addFeedBackByAdminController };
