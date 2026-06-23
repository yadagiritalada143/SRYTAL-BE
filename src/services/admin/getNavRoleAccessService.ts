import NavItemModel from '../../model/navItemModel';
import NavRoleAccessModel from '../../model/navRoleAccessModel';
import { surfaceForRole } from '../navigation/navResolver';

// Returns the catalog keys granted to a role in this org. If no explicit grant
// exists yet, defaults to the full surface catalog (matches runtime fallback).
const getNavRoleAccess = async (organizationId: string, role: string) => {
    const surface = surfaceForRole(role);
    const access = await NavRoleAccessModel.findOne({ organization: organizationId, role }).lean();

    let navKeys = access?.navKeys;
    let isDefault = false;
    if (!access) {
        const catalog = await NavItemModel.find({ surface }).select('key').lean();
        navKeys = catalog.map(i => i.key);
        isDefault = true;
    }

    return { success: true, role, surface, navKeys: navKeys || [], isDefault };
};

export default { getNavRoleAccess };
