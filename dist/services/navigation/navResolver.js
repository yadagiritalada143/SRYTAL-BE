"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectUrls = exports.buildMenuTree = exports.resolveEffectiveKeys = exports.surfaceForRole = void 0;
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
const navRoleAccessModel_1 = __importDefault(require("../../model/navRoleAccessModel"));
const navUserAccessModel_1 = __importDefault(require("../../model/navUserAccessModel"));
// admins use the 'admin' surface; everyone else (Employee/Recruiter/ContentWriter)
// uses the 'employee' surface.
const surfaceForRole = (role) => role === 'admin' ? 'admin' : 'employee';
exports.surfaceForRole = surfaceForRole;
/**
 * Resolves the set of catalog keys a user may access:
 *   (roleKeys ∪ addedKeys) − removedKeys ∪ systemKeys(surface)
 * If the role has no explicit grant yet, falls back to the full catalog for the
 * surface so a fresh/unconfigured org keeps today's "see everything" behaviour.
 */
const resolveEffectiveKeys = async (organizationId, role, userId, surface) => {
    const [catalog, roleAccess, userAccess] = await Promise.all([
        navItemModel_1.default.find({ surface }).select('key isSystem').lean(),
        navRoleAccessModel_1.default.findOne({ organization: organizationId, role }).lean(),
        navUserAccessModel_1.default.findOne({ organization: organizationId, userId }).lean()
    ]);
    const systemKeys = catalog.filter(i => i.isSystem).map(i => i.key);
    const roleKeys = roleAccess
        ? roleAccess.navKeys || []
        : catalog.map(i => i.key); // fallback: full surface catalog
    const effective = new Set([...roleKeys, ...((userAccess === null || userAccess === void 0 ? void 0 : userAccess.addedKeys) || [])]);
    for (const k of (userAccess === null || userAccess === void 0 ? void 0 : userAccess.removedKeys) || [])
        effective.delete(k);
    for (const k of systemKeys)
        effective.add(k); // system items can never be removed
    return effective;
};
exports.resolveEffectiveKeys = resolveEffectiveKeys;
/** Builds an ordered parent/children tree from a flat list of catalog items. */
const buildMenuTree = (items) => {
    const sorted = [...items].sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
    const roots = sorted.filter(i => !i.parentKey);
    const childrenByParent = new Map();
    for (const i of sorted) {
        if (i.parentKey) {
            if (!childrenByParent.has(i.parentKey))
                childrenByParent.set(i.parentKey, []);
            childrenByParent.get(i.parentKey).push(i);
        }
    }
    const toNode = (i) => {
        var _a;
        const kids = childrenByParent.get(i.key) || [];
        const node = {
            key: i.key,
            label: i.label,
            url: i.url,
            icon: i.icon,
            order: (_a = i.order) !== null && _a !== void 0 ? _a : 0,
            isSystem: !!i.isSystem
        };
        if (kids.length)
            node.children = kids.map(toNode);
        return node;
    };
    // Only include children whose parent is also present; orphans (parent not in
    // the effective set) are promoted to roots so they stay reachable.
    const presentKeys = new Set(sorted.map(i => i.key));
    const orphanRoots = sorted.filter(i => i.parentKey && !presentKeys.has(i.parentKey));
    return [...roots, ...orphanRoots].map(toNode);
};
exports.buildMenuTree = buildMenuTree;
/** Flattens a menu tree into the list of allowed org-relative URLs. */
const collectUrls = (nodes) => {
    const urls = [];
    const walk = (list) => {
        for (const n of list) {
            if (n.url)
                urls.push(n.url);
            if (n.children)
                walk(n.children);
        }
    };
    walk(nodes);
    return urls;
};
exports.collectUrls = collectUrls;
