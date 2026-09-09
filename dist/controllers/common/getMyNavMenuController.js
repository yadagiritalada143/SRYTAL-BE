"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const navMessages_1 = require("../../constants/navigation/navMessages");
const getMyNavMenuService_1 = __importDefault(require("../../services/common/getMyNavMenuService"));
const getMyNavMenu = (req, res) => {
    var _a, _b;
    getMyNavMenuService_1.default
        .getMyNavMenu((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId)
        .then(result => res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(result))
        .catch(error => {
        console.error(`Error in fetching navigation menu: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: navMessages_1.NAV_ERROR_MESSAGES.MENU_FETCH_ERROR });
    });
};
exports.default = { getMyNavMenu };
