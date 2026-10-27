"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validateQuizService_1 = __importDefault(require("../../services/common/validateQuizService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../constants/common/myCoursesMessages");
const validateQuiz = async (req, res) => {
    var _a;
    try {
        const { taskId, attemptId, answers } = req.body;
        if (!taskId || !attemptId || !Array.isArray(answers)) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_MISSING_FIELDS_MESSAGE
            });
        }
        const validationResult = await validateQuizService_1.default.validateQuiz(taskId, attemptId, answers, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (validationResult.success) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.OK).json({
                success: true,
                message: myCoursesMessages_1.MY_COURSES_SUCCESS_MESSAGES.QUIZ_VALIDATION_SUCCESS_MESSAGE,
                data: {
                    taskId: validationResult.taskId,
                    attemptId: validationResult.attemptId,
                    totalScoredQuestions: validationResult.totalScoredQuestions,
                    correctAnswers: validationResult.correctAnswers,
                    incorrectAnswers: validationResult.incorrectAnswers,
                    percentage: validationResult.percentage,
                    passingPercentage: validationResult.passingPercentage,
                    passed: validationResult.passed,
                    review: validationResult.review
                }
            });
        }
        if (validationResult.invalidTaskId) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_TASK_ID_MESSAGE
            });
        }
        if (validationResult.invalidAttemptId) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ATTEMPT_ID_MESSAGE
            });
        }
        if (validationResult.invalidAnswers) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_INVALID_ANSWERS_MESSAGE
            });
        }
        if (validationResult.taskNotFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_TASK_NOT_FOUND_MESSAGE
            });
        }
        if (validationResult.notQuizTask) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_NOT_QUIZ_TASK_MESSAGE
            });
        }
        // No assignment covering this task for the employee — same 404 the
        // other assignment-scoped endpoints use.
        if (validationResult.notFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
            });
        }
        // The attempt does not exist on this employee's progress row for this
        // task — treat as not found so attempt ids are not enumerable.
        if (validationResult.attemptNotFound) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_NOT_FOUND_MESSAGE
            });
        }
        if (validationResult.attemptAlreadyFinalized) {
            return res.status(commonErrorMessages_1.HTTP_STATUS.CONFLICT).json({
                success: false,
                message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_ATTEMPT_ALREADY_FINALIZED_MESSAGE
            });
        }
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_ERROR_MESSAGE
        });
    }
    catch (error) {
        console.error(`Error in validating quiz: ${error}`);
        return res.status(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.QUIZ_VALIDATION_ERROR_MESSAGE
        });
    }
};
exports.default = { validateQuiz };
