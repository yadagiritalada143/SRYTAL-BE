import NavItemModel from '../../model/navItemModel';
import NavRoleAccessModel from '../../model/navRoleAccessModel';
import NavUserAccessModel from '../../model/navUserAccessModel';
import { NavMenuNode, NavSurface } from '../../interfaces/navigation';

// admins use the 'admin' surface; everyone else (Employee/Recruiter/ContentWriter)
// uses the 'employee' surface.
export const surfaceForRole = (role?: string): NavSurface =>
    role === 'admin' ? 'admin' : 'Employee';

/**
 * Resolves the set of catalog keys a user may access:
 *   (roleKeys ∪ addedKeys) − removedKeys ∪ systemKeys(surface)
 * If the role has no explicit grant yet, falls back to the full catalog for the
 * surface so a fresh/unconfigured org keeps today's "see everything" behaviour.
 */
export const resolveEffectiveKeys = async (
    organizationId: string,
    role: string,
    userId: string,
    surface: NavSurface
): Promise<Set<string>> => {
    const [catalog, roleAccess, userAccess] = await Promise.all([
        NavItemModel.find({ surface }).select('key isSystem').lean(),
        NavRoleAccessModel.findOne({ organization: organizationId, role }).lean(),
        NavUserAccessModel.findOne({ organization: organizationId, userId }).lean()
    ]);

    const systemKeys = catalog.filter(i => i.isSystem).map(i => i.key);

    const roleKeys = roleAccess
        ? roleAccess.navKeys || []
        : catalog.map(i => i.key); // fallback: full surface catalog

    const effective = new Set<string>([...roleKeys, ...(userAccess?.addedKeys || [])]);
    for (const k of userAccess?.removedKeys || []) effective.delete(k);
    for (const k of systemKeys) effective.add(k); // system items can never be removed

    return effective;
};

/** Builds an ordered parent/children tree from a flat list of catalog items. */
export const buildMenuTree = (items: any[]): NavMenuNode[] => {
    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const roots = sorted.filter(i => !i.parentKey);
    const childrenByParent = new Map<string, any[]>();
    for (const i of sorted) {
        if (i.parentKey) {
            if (!childrenByParent.has(i.parentKey)) childrenByParent.set(i.parentKey, []);
            childrenByParent.get(i.parentKey)!.push(i);
        }
    }

    const toNode = (i: any): NavMenuNode => {
        const kids = childrenByParent.get(i.key) || [];
        const node: NavMenuNode = {
            key: i.key,
            label: i.label,
            url: i.url,
            icon: i.icon,
            order: i.order ?? 0,
            isSystem: !!i.isSystem
        };
        if (kids.length) node.children = kids.map(toNode);
        return node;
    };

    // Only include children whose parent is also present; orphans (parent not in
    // the effective set) are promoted to roots so they stay reachable.
    const presentKeys = new Set(sorted.map(i => i.key));
    const orphanRoots = sorted.filter(i => i.parentKey && !presentKeys.has(i.parentKey));

    return [...roots, ...orphanRoots].map(toNode);
};

/** Flattens a menu tree into the list of allowed org-relative URLs. */
export const collectUrls = (nodes: NavMenuNode[]): string[] => {
    const urls: string[] = [];
    const walk = (list: NavMenuNode[]) => {
        for (const n of list) {
            if (n.url) urls.push(n.url);
            if (n.children) walk(n.children);
        }
    };
    walk(nodes);
    return urls;
};
