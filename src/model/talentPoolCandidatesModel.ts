import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { ITalentPoolCandidates } from '../interfaces/talentpoolcandidates';
import UserModel from '../model/userModel';
import { DateTime } from 'aws-sdk/clients/devicefarm';

const TalentPoolCandidatesSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    candidateName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    contact: {
        email: { type: mongoose.Schema.Types.String },
        phone: { type: mongoose.Schema.Types.String }
    },
    totalYearsOfExperience: { type: mongoose.Schema.Types.Decimal128 },
    relaventYearsOfExperience: { type: mongoose.Schema.Types.Decimal128 },
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel },
        callStartsAt: { type: mongoose.Schema.Types.Date },
        callEndsAt: { type: mongoose.Schema.Types.Date },
        timeSpendForCall: { type: mongoose.Schema.Types.Decimal128 },
        comment: { type: mongoose.Schema.Types.String },
        updateAt: { type: mongoose.Schema.Types.Date }
    }],
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
