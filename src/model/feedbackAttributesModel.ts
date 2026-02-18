import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import IFeedbackAttributes from '../interfaces/feedbackattributes';

const FeedbackAttributesSchema = new mongoose.Schema({
    name: { type: mongoose.Schema.Types.String, required: true },
},
{
    collection: 'feedback-attribute',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

FeedbackAttributesSchema.plugin(uniqueValidator);
const FeedbackAttributesModel = mongoose.model<IFeedbackAttributes>('FeedbackAttributesModel', FeedbackAttributesSchema);

export default FeedbackAttributesModel;
