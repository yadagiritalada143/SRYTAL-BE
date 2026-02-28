"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const downloadSalarySlipService_1 = __importDefault(require("../../services/common/downloadSalarySlipService"));
const employeeSalarySlipMessage_1 = require("../../constants/common/employeeSalarySlipMessage");
const userModel_1 = __importDefault(require("../../model/userModel"));
const ADMIN_ROLES = ['admin', 'SuperAdmin'];
const downloadSalarySlipController = async (req, res) => {
    var _a;
    try {
        const { mongoId, fullName, month, year } = req.body;
        const authenticatedUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Validate required fields
        if (!mongoId || !fullName || !month || !year) {
            return res.status(employeeSalarySlipMessage_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.INVALID_REQUEST_PARAMS
            });
        }
        // Security check: Allow Admin/SuperAdmin to access any employee's salary slips
        // Regular employees can only access their own salary slips
        if (mongoId !== authenticatedUserId) {
            const currentUser = await userModel_1.default.findById(authenticatedUserId).select('userRole');
            const isAdmin = currentUser && ADMIN_ROLES.includes(currentUser.userRole || '');
            if (!isAdmin) {
                return res.status(employeeSalarySlipMessage_1.HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.UNAUTHORIZED_ACCESS
                });
            }
        }
        const result = await downloadSalarySlipService_1.default.downloadSalarySlipService({ mongoId, fullName, month, year });
        if (!result.success) {
            if (result.error === 'SALARY_SLIP_NOT_FOUND') {
                return res.status(employeeSalarySlipMessage_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.SALARY_SLIP_NOT_FOUND
                });
            }
            return res.status(employeeSalarySlipMessage_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR
            });
        }
        res.status(employeeSalarySlipMessage_1.HTTP_STATUS.OK).json({
            success: true,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED,
            data: {
                downloadUrl: result.downloadUrl,
                fileName: result.fileName
            }
        });
    }
    catch (error) {
        console.error(`Error in downloadSalarySlipController: ${error}`);
        res.status(employeeSalarySlipMessage_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: employeeSalarySlipMessage_1.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES.EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR
        });
    }
};
exports.default = { downloadSalarySlipController };
