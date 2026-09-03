import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { IExpertConsultation } from '../interfaces/expertConsultation';

const ExpertConsultationSchema = new mongoose.Schema({
    fullName: { type: mongoose.Schema.Types.String, required: true,},
    email: { type: mongoose.Schema.Types.String, required: true },
    phoneNumber: { type: mongoose.Schema.Types.String, required: true },
    company: { type: mongoose.Schema.Types.String, required: true },
    projectBudget: { type: mongoose.Schema.Types.String, required: true },
    timeline: { type: mongoose.Schema.Types.String, required: true },
    createdAt: { type: mongoose.Schema.Types.Date, default: Date.now },
    updatedAt: { type: mongoose.Schema.Types.Date, default: Date.now },
},

{
    collection: 'expert-consultations',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

ExpertConsultationSchema.plugin(uniqueValidator);

const ExpertConsultation = mongoose.model<IExpertConsultation>('ExpertConsultation', ExpertConsultationSchema);

export default ExpertConsultation;