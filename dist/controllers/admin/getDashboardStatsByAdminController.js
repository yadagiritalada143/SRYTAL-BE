"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getDashboardStatsByAdminService_1 = __importDefault(require("../../services/admin/getDashboardStatsByAdminService"));
const getDashboardStats = async (req, res) => {
    try {
        const { organizationId, userId } = req.user || {};
        const result = await getDashboardStatsByAdminService_1.default.getDashboardStatsByAdmin(organizationId, userId);
        res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(result);
    }
    catch (error) {
        console.error(`Error in fetching admin dashboard stats: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: commonErrorMessages_1.COMMON_ERRORS.USER_FETCHING_ERROR
        });
    }
};
exports.default = { getDashboardStats };
