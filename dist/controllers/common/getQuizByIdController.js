"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getQuizByIdService_1 = __importDefault(require("../../services/common/getQuizByIdService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../constants/common/myCoursesMessages");
const getQuizById = async (req, res) => {
    var _a;
    try {
        const { taskId } = req.params;
        if (!taskId) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }
        const quizResponse = await getQuizByIdService_1.default.getQuizById(taskId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (quizResponse.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: myCoursesMessages_1.MY_COURSES_SUCCESS_MESSAGES.QUIZ_FETCH_SUCCESS_MESSAGE,
                data: {
                    taskId: quizResponse.taskId,
                    attemptId: quizResponse.attemptId,
                    taskName: quizResponse.taskName,
                    totalQuestions: quizResponse.totalQuestions,
                    questions: quizResponse.questions
                }
            });
        }
        if (quizResponse.invalidTaskId) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }
        if (quizResponse.taskNotFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
            });
        }
        if (quizResponse.notQuizTask) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
            });
        }
        if (quizResponse.taskInactive) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_ACTIVE_MESSAGE
            });
        }
        // No assignment covering this task for the employee (or the course is
        // archived) — the same 404 the other assignment-scoped endpoints use.
        if (quizResponse.notFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_FETCH_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in fetching quiz by id: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_FETCH_ERROR_MESSAGE
        });
    }
};
exports.default = { getQuizById };
