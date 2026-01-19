"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseTaskService_1 = __importDefault(require("../../services/contentwriter/updateCourseTaskService"));
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
const validateCourseStatusTypesUtil_1 = __importDefault(require("../../util/validateCourseStatusTypesUtil"));
const updateCourseTaskController = async (req, res) => {
    try {
        const { id, taskName, taskDescription, thumbnail, status } = req.body;
        if (!(0, validateCourseStatusTypesUtil_1.default)(status)) {
            return res.status(400).json({
                success: false,
                message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_STATUS_MESSAGE,
            });
        }
        const updateCourseResponse = await updateCourseTaskService_1.default.updateCourseTask(id, taskName, taskDescription, thumbnail, status.toUpperCase());
        res.status(200).json(updateCourseResponse);
    }
    catch (error) {
        console.error(`Error in updating course task: ${error}`);
        res.status(500).json({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_UPDATE_ERROR_MESSAGE,
        });
    }
};
exports.default = { updateCourseTaskController };
