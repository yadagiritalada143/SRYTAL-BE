import FeedbackAttributesModel from '../../model/feedbackAttributesModel';
import IFeedbackAttributes from '../../interfaces/feedbackattributes';

const getFeedBackAttributeByAdminService = async (id: string): Promise<IFeedbackAttributes | null> =>{
    try{
        const feedbackAttributeDetails = await FeedbackAttributesModel.findOne({_id: id});
        return feedbackAttributeDetails;
    } catch (error: any) {
        throw new Error('Error in fetching feedback attribute details');
    }
}

export default { getFeedBackAttributeByAdminService }