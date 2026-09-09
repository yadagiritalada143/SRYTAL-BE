"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const navMessages_1 = require("../../constants/navigation/navMessages");
const getNavCatalogService_1 = __importDefault(require("../../services/admin/getNavCatalogService"));
const getNavCatalog = (req, res) => {
    getNavCatalogService_1.default
        .getNavCatalog(req.query.surface)
        .then(result => res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(result))
        .catch(error => {
        console.error(`Error in fetching nav catalog: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: navMessages_1.NAV_ERROR_MESSAGES.CATALOG_FETCH_ERROR });
    });
};
exports.default = { getNavCatalog };
