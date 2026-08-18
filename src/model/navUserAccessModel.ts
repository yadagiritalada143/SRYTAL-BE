import mongoose from 'mongoose';
import Organization from './organization';
import UserModel from './userModel';
import { INavUserAccess } from '../interfaces/navigation';

// Per-user overrides on top of the role grant: extra items granted (addedKeys)
// and specific items revoked (removedKeys). One document per overridden user.
const NavUserAccessSchema = new mongoose.Schema(
    {
        organization: { type: mongoose.Schema.Types.ObjectId, ref: Organization, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: UserModel, required: true },
        addedKeys: [{ type: mongoose.Schema.Types.String }],
        removedKeys: [{ type: mongoose.Schema.Types.String }]
    },
    {
        collection: 'nav-user-access',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

NavUserAccessSchema.index({ organization: 1, userId: 1 }, { unique: true });

const NavUserAccessModel = mongoose.model<INavUserAccess>('NavUserAccessModel', NavUserAccessSchema);

export default NavUserAccessModel;
