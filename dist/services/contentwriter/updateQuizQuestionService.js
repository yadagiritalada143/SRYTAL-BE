"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const QUESTION_TYPES = ['RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA'];
const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeAndValidateOptions = (type, options) => {
    if (type === 'TEXTAREA') {
        // Free text: options are never stored, regardless of what was supplied.
        return { valid: true, options: undefined };
    }
    if (!Array.isArray(options) || options.length === 0) {
        return { valid: false, message: 'Options are required for this question type !' };
    }
    const normalized = options.map((opt) => {
        var _a;
        return (Object.assign({ value: String((_a = opt === null || opt === void 0 ? void 0 : opt.value) !== null && _a !== void 0 ? _a : '').trim() }, ((opt === null || opt === void 0 ? void 0 : opt.isanswer) === true ? { isanswer: true } : {})));
    });
    if (normalized.some((opt) => opt.value.length === 0)) {
        return { valid: false, message: 'Option value cannot be empty !' };
    }
    const uniqueValues = new Set(normalized.map((opt) => opt.value.toLowerCase()));
    if (uniqueValues.size !== normalized.length) {
        return { valid: false, message: 'Option values must be unique !' };
    }
    const answerCount = normalized.filter((opt) => opt.isanswer === true).length;
    if (type === 'RADIO' || type === 'DROPDOWN' || type === 'CHECKBOX') {
        if (normalized.length < 4) {
            return { valid: false, message: 'At least 4 options are required !' };
        }
    }
    if (type === 'TOGGLE') {
        if (normalized.length !== 2) {
            return { valid: false, message: 'Exactly 2 options are required !' };
        }
    }
    if (type === 'RADIO' || type === 'DROPDOWN' || type === 'TOGGLE') {
        if (answerCount !== 1) {
            return { valid: false, message: 'Exactly one correct answer is required !' };
        }
    }
    if (type === 'CHECKBOX' && answerCount < 1) {
        return { valid: false, message: 'At least one correct answer is required !' };
    }
    return { valid: true, options: normalized };
};
const updateQuizQuestion = async (payload) => {
    try {
        const { questionId, question, type, options, status } = payload || {};
        if (!questionId || !isValidObjectId(questionId)) {
            return { success: false, invalidQuestionId: true };
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
        const finalType = type
            ? String(type).toUpperCase()
            : existing.type;
        if (!QUESTION_TYPES.includes(finalType)) {
            return { success: false, invalidQuestionType: true };
        }
        const finalQuestion = question !== undefined ? String(question).trim() : String(existing.question || '').trim();
        if (finalQuestion === '') {
            return { success: false, invalidQuestion: true };
        }
        const optionsSource = options !== undefined ? options : finalType === 'TEXTAREA' ? undefined : existing.options;
        const optionResult = normalizeAndValidateOptions(finalType, optionsSource);
        if (!optionResult.valid) {
            return { success: false, invalidOptions: true, message: optionResult.message };
        }
        let finalStatus = existing.status;
        if (status !== undefined) {
            const normalizedStatus = String(status).toUpperCase();
            if (normalizedStatus !== 'SHOW' && normalizedStatus !== 'HIDE') {
                return { success: false, invalidStatus: true };
            }
            finalStatus = normalizedStatus;
        }
        if (finalQuestion.toLowerCase() !== String(existing.question || '').toLowerCase()) {
            const duplicate = await courseQuizQuestionModel_1.default.findOne({
                _id: { $ne: questionId },
                taskId: existing.taskId,
                isDeleted: false,
                question: { $regex: `^${escapeRegExp(finalQuestion)}$`, $options: 'i' },
            }).lean();
            if (duplicate) {
                return { success: false, duplicateQuestion: true };
            }
        }
        const updateData = {
            question: finalQuestion,
            type: finalType,
            status: finalStatus,
        };
        if (finalType === 'TEXTAREA') {
            updateData.options = undefined;
        }
        else {
            updateData.options = optionResult.options;
        }
        const updated = await courseQuizQuestionModel_1.default.findByIdAndUpdate(questionId, updateData, {
            new: true,
        }).lean();
        if (task.moduleId) {
            const module = await coursemoduleModel_1.default.findById(task.moduleId).select('courseId').lean();
            if (module === null || module === void 0 ? void 0 : module.courseId) {
                await coursesModel_1.default.findByIdAndUpdate(module.courseId, { $currentDate: { updatedAt: true } });
            }
        }
        return { success: true, question: updated };
    }
    catch (error) {
        console.error(`Error in updating quiz question: ${error}`);
        return { success: false };
    }
};
exports.default = { updateQuizQuestion };
