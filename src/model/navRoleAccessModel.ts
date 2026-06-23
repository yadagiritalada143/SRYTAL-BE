import mongoose from 'mongoose';
import Organization from './organization';
import { INavRoleAccess } from '../interfaces/navigation';

// Which catalog items a role can see/access, scoped to an organization.
// One document per (organization, role).
const NavRoleAccessSchema = new mongoose.Schema(
    {
        organization: { type: mongoose.Schema.Types.ObjectId, ref: Organization, required: true },
        role: { type: mongoose.Schema.Types.String, required: true },
        navKeys: [{ type: mongoose.Schema.Types.String }]
    },
    {
        collection: 'nav-role-access',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

NavRoleAccessSchema.index({ organization: 1, role: 1 }, { unique: true });

const NavRoleAccessModel = mongoose.model<INavRoleAccess>('NavRoleAccessModel', NavRoleAccessSchema);

export default NavRoleAccessModel;
