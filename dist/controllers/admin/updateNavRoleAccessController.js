"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const navMessages_1 = require("../../constants/navigation/navMessages");
const updateNavRoleAccessService_1 = __importDefault(require("../../services/admin/updateNavRoleAccessService"));
const updateNavRoleAccess = (req, res) => {
    var _a;
    const { role, navKeys } = req.body;
    if (!role) {
        return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'role is required' });
    }
    updateNavRoleAccessService_1.default
        .updateNavRoleAccess((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId, role, navKeys || [])
        .then(result => res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(Object.assign(Object.assign({}, result), { message: navMessages_1.NAV_SUCCESS_MESSAGES.ROLE_ACCESS_UPDATED })))
        .catch(error => {
        console.error(`Error in updating role nav access: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: navMessages_1.NAV_ERROR_MESSAGES.ROLE_ACCESS_UPDATE_ERROR });
    });
};
exports.default = { updateNavRoleAccess };
