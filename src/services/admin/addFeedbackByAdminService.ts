import FeedbackAttributesModel from '../../model/feedbackAttributesModel';

const addFeedbackByAdminService = async (name: string, comment?: string, rating?: number) => {
    try {
       const createdAttribute: any = new FeedbackAttributesModel({ name, comment, rating });
       const result = await createdAttribute.save();
       return result;
    } catch (error: any) {
        console.error(`Error while adding feedback: ${error}`);
        throw new Error('An error occurred while adding feedback.');
    }
};
 
export default { addFeedbackByAdminService };
