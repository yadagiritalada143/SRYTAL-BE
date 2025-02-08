import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ITalentPoolCandidates } from '../interfaces/talentpoolcandidates';
import UserModel from '../model/userModel';

const TalentPoolCandidatesSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    candidateName: { type: mongoose.Schema.Types.String, required: true },
    contact: {
        email: { type: mongoose.Schema.Types.String, required: true, unique: true },
        phone: { type: mongoose.Schema.Types.String, required: true, unique: true }
    },
    totalYearsOfExperience: { type: mongoose.Schema.Types.Number },
    relaventYearsOfExperience: { type: mongoose.Schema.Types.Number },
    evaluatedSkills: { type: mongoose.Schema.Types.String },
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
        callStartsAt: { type: mongoose.Schema.Types.Date },
        callEndsAt: { type: mongoose.Schema.Types.Date },
        comment: { type: mongoose.Schema.Types.String },
        updateAt: { type: mongoose.Schema.Types.Date }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
    createdAt: { type: mongoose.Schema.Types.Date },
    lastUpdatedAt: { type: mongoose.Schema.Types.Date }
}, {
    collection: 'talent-pool-candidates',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

TalentPoolCandidatesSchema.plugin(uniqueValidator);

const TalentPoolCandidatesModel = mongoose.model<ITalentPoolCandidates>('TalentPoolCandidatesSchema', TalentPoolCandidatesSchema);
export default TalentPoolCandidatesModel;
