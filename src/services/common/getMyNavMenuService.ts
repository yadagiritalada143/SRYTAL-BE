import UserModel from '../../model/userModel';
import NavItemModel from '../../model/navItemModel';
import { GetMyNavMenuResponse } from '../../interfaces/navigation';
import {
    surfaceForRole,
    resolveEffectiveKeys,
    buildMenuTree,
    collectUrls
} from '../navigation/navResolver';

const getMyNavMenu = async (userId: string, organizationId: string): Promise<GetMyNavMenuResponse> => {
    const user = await UserModel.findById(userId).select('userRole organization').lean();
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const role = user.userRole || '';
    const orgId = organizationId || String(user.organization || '');
    const surface = surfaceForRole(role);

    const effectiveKeys = await resolveEffectiveKeys(orgId, role, userId, surface);

    // All catalog items for the surface — needed so the client guard can tell a
    // "managed" menu page (block if not granted) from an unmanaged action/detail
    // page (always allowed, reached from within a granted section).
    const allSurfaceItems = await NavItemModel.find({ surface }).lean();
    const items = allSurfaceItems.filter(i => effectiveKeys.has(i.key));

    const menu = buildMenuTree(items);
    const allowedUrls = collectUrls(menu);
    const managedUrls = allSurfaceItems.map(i => i.url).filter((u): u is string => !!u);

    return { success: true, surface, menu, allowedUrls, managedUrls };
};

export default { getMyNavMenu };
