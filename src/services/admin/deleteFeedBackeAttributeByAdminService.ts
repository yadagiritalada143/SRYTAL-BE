import FeedbackAttributesModel from '../../model/feedbackAttributesModel';
import { DeleteFeedBackAttributeByAdminResponse } from '../../interfaces/feedbackattributes';

const deleteFeedBackAttributeByAdminService = async (id: string): Promise<DeleteFeedBackAttributeByAdminResponse> => {
    try {
        const result = await FeedbackAttributesModel.findByIdAndDelete(id);
        if(result) {
             return { success: true, responseAfterDelete: result };
        } else {
            return { success: false };
        }
    } catch ( error: any) {
        console.error(`Error in deleting feedback attribute: ${error}`);
        return { success: false };
    }
};

export default { deleteFeedBackAttributeByAdminService };