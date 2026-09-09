"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getOrganizationThemesService_1 = __importDefault(require("../../services/common/getOrganizationThemesService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getOrganizationThemes = (req, res) => {
    const { organization_name } = req.params;
    getOrganizationThemesService_1.default
        .getOrgThemes(organization_name)
        .then((themesResponse) => {
        res.status(200).json({ success: true, themesResponse });
    })
        .catch((error) => {
        console.error(error);
        res.status(500).json({ success: false, message: commonErrorMessages_1.ORGANIZATION_THEMES_ERROR_MESSAGES.THEMES_FETCHING_ERROR });
    });
};
exports.default = { getOrganizationThemes };
