"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reorderCourseTasksService_1 = __importDefault(require("../../services/contentwriter/reorderCourseTasksService"));
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const reorderCourseTasks = async (req, res) => {
    try {
        const { moduleId, tasks } = req.body;
        const result = await reorderCourseTasksService_1.default.reorderCourseTasks(moduleId, tasks);
        if (result.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: coursetaskMessages_1.COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_REORDER_SUCCESS_MESSAGE,
                data: result.data
            });
        }
        switch (result.errorCode) {
            case 'INVALID_MODULE_ID':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_MODULE_ID_MESSAGE
                });
            case 'MODULE_NOT_FOUND':
                return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_MODULE_NOT_FOUND_MESSAGE
                });
            case 'INVALID_TASKS':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_TASKS_REQUIRED_MESSAGE
                });
            case 'INVALID_TASK_ID':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_TASK_ID_MESSAGE
                });
            case 'TASK_NOT_FOUND':
                return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_TASK_NOT_FOUND_MESSAGE
                });
            case 'TASK_NOT_IN_MODULE':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_NOT_IN_MODULE_MESSAGE
                });
            case 'DUPLICATE_TASK_ID':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_TASK_ID_MESSAGE
                });
            case 'INVALID_ORDER_IDX':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_INVALID_ORDER_IDX_MESSAGE
                });
            case 'DUPLICATE_ORDER_IDX':
                return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE
                });
            default:
                return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_REORDER_ERROR_MESSAGE
                });
        }
    }
    catch (error) {
        console.error(`Error in reordering course tasks: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_REORDER_ERROR_MESSAGE
        });
    }
};
exports.default = { reorderCourseTasks };
