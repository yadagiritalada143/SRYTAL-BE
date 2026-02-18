import FeedbackAttributesModel from "../../model/feedbackAttributesModel";
import {updateFeedBackAttributeResponse} from '../../interfaces/feedbackattributes';

const updateFeedbackAttributeByAdminService = async (id: string, name: string): Promise<updateFeedBackAttributeResponse > => {
    try {
        const result = await FeedbackAttributesModel.updateOne({ _id: id }, { name });
        if (result) {
            return { success: true, responseAfterupdate: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error(`Error in updating feedback attribute: ${error}`);
        throw error;
    }
}

export default { updateFeedbackAttributeByAdminService };
