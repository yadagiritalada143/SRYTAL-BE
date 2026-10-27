"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateMyTaskAcknowledgementService_1 = __importDefault(require("../../services/common/updateMyTaskAcknowledgementService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../constants/common/myCoursesMessages");
const updateMyTaskAcknowledgement = async (req, res) => {
    var _a;
    try {
        const { courseAssignmentId, taskId, acknowledged } = req.body;
        const acknowledgementResponse = await updateMyTaskAcknowledgementService_1.default.updateMyTaskAcknowledgement(courseAssignmentId, taskId, acknowledged, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (acknowledgementResponse.notFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }
        if (acknowledgementResponse.invalidTask) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_ASSIGNED_COURSE_MESSAGE
            });
        }
        if (acknowledgementResponse.notFileTask) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_APPLIES_TO_FILE_MESSAGE
            });
        }
        if (acknowledgementResponse.revocationNotAllowed) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_REVOCATION_NOT_ALLOWED_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
            success: true,
            message: myCoursesMessages_1.MY_COURSES_SUCCESS_MESSAGES.TASK_ACKNOWLEDGEMENT_UPDATE_SUCCESS_MESSAGE,
            data: {
                courseAssignmentId: acknowledgementResponse.courseAssignmentId,
                taskId: acknowledgementResponse.taskId,
                acknowledged: acknowledgementResponse.acknowledged,
                acknowledgedAt: acknowledgementResponse.acknowledgedAt
            }
        });
    }
    catch (error) {
        console.error(`Error in updating task acknowledgement: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_ACKNOWLEDGEMENT_UPDATE_ERROR_MESSAGE
        });
    }
};
exports.default = { updateMyTaskAcknowledgement };
