"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const escapeRegExp = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
const createQuizQuestion = async (taskId, question, type, options, status) => {
    try {
        const task = await courseTaskModel_1.default.findById(taskId)
            .select('type moduleId')
            .lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }
        const trimmedQuestion = String(question || '').trim();
        const existingQuestion = await courseQuizQuestionModel_1.default.findOne({
            taskId,
            isDeleted: false,
            question: { $regex: `^${escapeRegExp(trimmedQuestion)}$`, $options: 'i' }
        }).lean();
        if (existingQuestion) {
            return { success: false, duplicateQuestion: true };
        }
        const newQuestion = await courseQuizQuestionModel_1.default.create(Object.assign(Object.assign({ taskId,
            question,
            type }, (type === 'TEXTAREA' ? {} : { options })), { status, isDeleted: false }));
        const module = await coursemoduleModel_1.default.findById(task.moduleId)
            .select('courseId')
            .lean();
        if (module === null || module === void 0 ? void 0 : module.courseId) {
            await coursesModel_1.default.findByIdAndUpdate(module.courseId, {
                $currentDate: { updatedAt: true }
            });
        }
        return { success: true, question: newQuestion };
    }
    catch (error) {
        console.error(`Error in creating quiz question for task ${taskId}: ${error}`);
        return { success: false };
    }
};
exports.default = { createQuizQuestion };
