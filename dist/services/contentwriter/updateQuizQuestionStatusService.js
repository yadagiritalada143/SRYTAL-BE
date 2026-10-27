"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));
const updateQuizQuestionStatus = async (questionId, status) => {
    try {
        if (!questionId || !isValidObjectId(questionId)) {
            return { success: false, invalidQuestionId: true };
        }
        const normalizedStatus = String(status || '').toUpperCase();
        if (normalizedStatus !== 'SHOW' && normalizedStatus !== 'HIDE') {
            return { success: false, invalidStatus: true };
        }
        const existing = await courseQuizQuestionModel_1.default.findOne({
            _id: questionId,
            isDeleted: false,
        }).lean();
        if (!existing) {
            return { success: false, questionNotFound: true };
        }
        const task = await courseTaskModel_1.default.findById(existing.taskId).select('type moduleId').lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }
        const updated = await courseQuizQuestionModel_1.default.findByIdAndUpdate(questionId, { status: normalizedStatus }, { new: true }).lean();
        if (task.moduleId) {
            const module = await coursemoduleModel_1.default.findById(task.moduleId).select('courseId').lean();
            if (module === null || module === void 0 ? void 0 : module.courseId) {
                await coursesModel_1.default.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
            }
        }
        return { success: true, question: updated };
    }
    catch (error) {
        console.error(`Error in updating quiz question status: ${error}`);
        return { success: false };
    }
};
exports.default = { updateQuizQuestionStatus };
