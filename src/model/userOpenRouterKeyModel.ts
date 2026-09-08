import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator'; 
import { IUserOpenRouterKey } from '../interfaces/userOpenRouterKeyInterface';
import UserModel from '../model/userModel';

const UserOpenRouterKeySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel, required: true, unique: true },
    openrouterKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
},
{
    collection: 'user-openrouter-key',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

UserOpenRouterKeySchema.plugin(uniqueValidator);

const UserOpenRouterKey = mongoose.model<IUserOpenRouterKey>('UserOpenRouterKey',UserOpenRouterKeySchema);

export default UserOpenRouterKey;
