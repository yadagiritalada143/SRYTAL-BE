import FeedbackAttributesModel from '../../model/feedbackAttributesModel';
import  {FetchAllFeedbackAttributes} from '../../interfaces/feedbackattributes';

const getAllFeedbackAttributeByAdmin = async (): Promise<FetchAllFeedbackAttributes> => {
    const getallfeedbacks = await FeedbackAttributesModel.find();
    const feedbackAttributes = getallfeedbacks.map((feedbackAttribute) =>({
        id: feedbackAttribute.id,
        name: feedbackAttribute.name,
    }));
    return { success: true, feedbackAttributeResponse: feedbackAttributes };
};
    
export default { getAllFeedbackAttributeByAdmin };
