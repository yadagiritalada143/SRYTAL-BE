"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseModuleService_1 = __importDefault(require("../../services/contentwriter/updateCourseModuleService"));
const coursemoduleMessages_1 = require("../../constants/contentwriter/coursemoduleMessages");
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../util/validateCourseStatusTypesUtil"));
const updateCourseModuleController = async (req, res) => {
    try {
        const { id, moduleName, moduleDescription, thumbnail, status } = req.body;
        if (!(0, validateCourseStatusTypesUtil_1.default)(status)) {
            return res.status(400).json({
                success: false,
                message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_INVALID_STATUS_MESSAGE,
            });
        }
        const updateCourseModuleResponse = await updateCourseModuleService_1.default.updateCourseModule(id, moduleName, moduleDescription, thumbnail, status.toUpperCase());
        res.status(200).json(updateCourseModuleResponse);
    }
    catch (error) {
        console.error(`Error in updating module: ${error}`);
        res.status(500).json({
            success: false,
            message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_UPDATE_ERROR_MESSAGE,
        });
    }
};
exports.default = { updateCourseModuleController };
