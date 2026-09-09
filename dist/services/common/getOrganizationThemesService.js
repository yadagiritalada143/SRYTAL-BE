"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const organizationThemesModel_1 = __importDefault(require("../../model/organizationThemesModel"));
const getOrgThemes = async (organization_name) => {
    try {
        const result = await organizationThemesModel_1.default.findOne({ organization_name });
        return result;
    }
    catch (error) {
        console.error(`Error occured while fetching the themes: ${error}`);
        return error;
    }
};
exports.default = { getOrgThemes };
