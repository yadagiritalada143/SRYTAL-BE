"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateMyTaskProgressService_1 = __importDefault(require("../../services/common/updateMyTaskProgressService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../constants/common/myCoursesMessages");
const updateMyTaskProgress = async (req, res) => {
    var _a;
    try {
        const { courseAssignmentId, taskId, isCompleted } = req.body;
        if (!courseAssignmentId || !taskId || typeof isCompleted !== 'boolean') {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_MISSING_FIELDS_MESSAGE
            });
        }
        const progressResponse = await updateMyTaskProgressService_1.default.updateMyTaskProgress(courseAssignmentId, taskId, isCompleted, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (progressResponse.notFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }
        if (progressResponse.invalidTask) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_COURSE_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json(Object.assign(Object.assign({}, progressResponse), { message: myCoursesMessages_1.MY_COURSES_SUCCESS_MESSAGES.TASK_PROGRESS_UPDATE_SUCCESS_MESSAGE }));
    }
    catch (error) {
        console.error(`Error in updating task progress: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_UPDATE_ERROR_MESSAGE
        });
    }
};
exports.default = { updateMyTaskProgress };
