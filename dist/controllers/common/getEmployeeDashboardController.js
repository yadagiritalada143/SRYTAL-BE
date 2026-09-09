"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const getEmployeeDashboardService_1 = __importDefault(require("../../services/common/getEmployeeDashboardService"));
const getEmployeeDashboard = (req, res) => {
    var _a;
    getEmployeeDashboardService_1.default
        .getEmployeeDashboard((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)
        .then(dashboardResponse => {
        res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(dashboardResponse);
    })
        .catch(error => {
        console.error(`Error in fetching employee dashboard: ${error}`);
        res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: commonErrorMessages_1.EMPLOYEE_ERRORS.EMPLOYEE_DASHBOARD_FETCHING_ERROR });
    });
};
exports.default = { getEmployeeDashboard };
