import UserModel from '../../model/userModel';
import NavItemModel from '../../model/navItemModel';
import NavUserAccessModel from '../../model/navUserAccessModel';
import { surfaceForRole } from '../navigation/navResolver';

// Upserts a user's overrides. A system item can never be revoked, so any such key
// is stripped from removedKeys before saving.
const updateNavUserAccess = async (
    organizationId: string,
    userId: string,
    addedKeys: string[],
    removedKeys: string[]
) => {
    const user = await UserModel.findById(userId).select('userRole').lean();
    const surface = surfaceForRole(user?.userRole);
    const systemItems = await NavItemModel.find({ surface, isSystem: true }).select('key').lean();
    const systemKeys = new Set(systemItems.map(i => i.key));

    const cleanAdded = Array.from(new Set(addedKeys || []));
    const cleanRemoved = Array.from(new Set(removedKeys || [])).filter(k => !systemKeys.has(k));

    const updated = await NavUserAccessModel.findOneAndUpdate(
        { organization: organizationId, userId },
        { organization: organizationId, userId, addedKeys: cleanAdded, removedKeys: cleanRemoved },
        { new: true, upsert: true }
    ).lean();

    return { success: true, userAccess: updated };
};

export default { updateNavUserAccess };
