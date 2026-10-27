"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const navMessages_1 = require("../../constants/navigation/navMessages");
const updateNavUserAccessService_1 = __importDefault(require("../../services/admin/updateNavUserAccessService"));
const updateNavUserAccess = (req, res) => {
    var _a;
    const { userId, addedKeys, removedKeys } = req.body;
    if (!userId) {
        return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'userId is required' });
    }
    updateNavUserAccessService_1.default
        .updateNavUserAccess((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId, userId, addedKeys || [], removedKeys || [])
        .then(result => res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(Object.assign(Object.assign({}, result), { message: navMessages_1.NAV_SUCCESS_MESSAGES.USER_ACCESS_UPDATED })))
        .catch(error => {
        console.error(`Error in updating user nav access: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: navMessages_1.NAV_ERROR_MESSAGES.USER_ACCESS_UPDATE_ERROR });
    });
};
exports.default = { updateNavUserAccess };
