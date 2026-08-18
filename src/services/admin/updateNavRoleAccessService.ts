import NavItemModel from '../../model/navItemModel';
import NavRoleAccessModel from '../../model/navRoleAccessModel';
import { surfaceForRole } from '../navigation/navResolver';

// Upserts the role grant. System items for the surface are always kept so an
// admin can never strip a non-revocable item (e.g. the Menu Access page itself).
const updateNavRoleAccess = async (organizationId: string, role: string, navKeys: string[]) => {
    const surface = surfaceForRole(role);
    const systemItems = await NavItemModel.find({ surface, isSystem: true }).select('key').lean();
    const systemKeys = systemItems.map(i => i.key);

    const finalKeys = Array.from(new Set([...(navKeys || []), ...systemKeys]));

    const updated = await NavRoleAccessModel.findOneAndUpdate(
        { organization: organizationId, role },
        { organization: organizationId, role, navKeys: finalKeys },
        { new: true, upsert: true }
    ).lean();

    return { success: true, roleAccess: updated };
};

export default { updateNavRoleAccess };
