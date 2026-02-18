import FeedbackAttributesModel from '../../model/feedbackAttributesModel';
import  {FetchAllFeedBackAttributes} from '../../interfaces/feedbackattributes';

const getAllFeedBackAttributeByAdminService = async (): Promise<FetchAllFeedBackAttributes> => {
    const getallfeedbacks = await FeedbackAttributesModel.find();
    const feedbackAttributes = getallfeedbacks.map((feedbackAttribute) =>({
        id: feedbackAttribute.id,
        name: feedbackAttribute.name,
    }));
    return { success: true, feedbackAttributeResponse: feedbackAttributes };
};
    
export default { getAllFeedBackAttributeByAdminService };
