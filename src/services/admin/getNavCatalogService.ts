import NavItemModel from '../../model/navItemModel';

// Returns the full menu catalog (optionally filtered by surface) for admins to
// pick from when granting access. Catalog is global/app-wide.
const getNavCatalog = async (surface?: string) => {
    const filter: any = {};
    if (surface) filter.surface = surface;
    const items = await NavItemModel.find(filter).sort({ surface: 1, order: 1 }).lean();
    return { success: true, catalog: items };
};

export default { getNavCatalog };
