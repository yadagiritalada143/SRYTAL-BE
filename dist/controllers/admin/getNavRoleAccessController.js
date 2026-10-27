"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const navMessages_1 = require("../../constants/navigation/navMessages");
const getNavRoleAccessService_1 = __importDefault(require("../../services/admin/getNavRoleAccessService"));
const getNavRoleAccess = (req, res) => {
    var _a;
    getNavRoleAccessService_1.default
        .getNavRoleAccess((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId, req.params.role)
        .then(result => res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(result))
        .catch(error => {
        console.error(`Error in fetching role nav access: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: navMessages_1.NAV_ERROR_MESSAGES.ROLE_ACCESS_FETCH_ERROR });
    });
};
exports.default = { getNavRoleAccess };
