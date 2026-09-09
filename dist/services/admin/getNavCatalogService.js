"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const navItemModel_1 = __importDefault(require("../../model/navItemModel"));
// Returns the full menu catalog (optionally filtered by surface) for admins to
// pick from when granting access. Catalog is global/app-wide.
const getNavCatalog = async (surface) => {
    const filter = {};
    if (surface)
        filter.surface = surface;
    const items = await navItemModel_1.default.find(filter).sort({ surface: 1, order: 1 }).lean();
    return { success: true, catalog: items };
};
exports.default = { getNavCatalog };
