import FeedbackAttributesModel from '../../model/feedbackAttributesModel';

const addFeedbackAttributeByAdminService = async (name: string) => {
    try {
       const createdAttribute: any = new FeedbackAttributesModel({ name });
       const result = await createdAttribute.save();
       return result;
    } catch (error: any) {
        console.error(`Error while adding feedback attribute: ${error}`);
        throw new Error('An error occurred while adding feedback attribute.');
    }
};
 
export default { addFeedbackAttributeByAdminService };
