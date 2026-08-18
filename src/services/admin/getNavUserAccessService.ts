import UserModel from '../../model/userModel';
import NavItemModel from '../../model/navItemModel';
import NavRoleAccessModel from '../../model/navRoleAccessModel';
import NavUserAccessModel from '../../model/navUserAccessModel';
import { surfaceForRole } from '../navigation/navResolver';

// Returns, for one employee, the role-inherited baseline keys plus their
// per-user added/removed overrides — everything the admin UI needs to render the
// per-user editor.
const getNavUserAccess = async (organizationId: string, userId: string) => {
    const user = await UserModel.findById(userId).select('userRole firstName lastName').lean();
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const role = user.userRole || '';
    const surface = surfaceForRole(role);

    const [roleAccess, userAccess] = await Promise.all([
        NavRoleAccessModel.findOne({ organization: organizationId, role }).lean(),
        NavUserAccessModel.findOne({ organization: organizationId, userId }).lean()
    ]);

    let roleKeys = roleAccess?.navKeys;
    if (!roleAccess) {
        const catalog = await NavItemModel.find({ surface }).select('key').lean();
        roleKeys = catalog.map(i => i.key);
    }

    return {
        success: true,
        userId,
        role,
        surface,
        roleKeys: roleKeys || [],
        addedKeys: userAccess?.addedKeys || [],
        removedKeys: userAccess?.removedKeys || []
    };
};

export default { getNavUserAccess };
