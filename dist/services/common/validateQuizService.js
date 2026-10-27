"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const taskProgressModel_1 = __importDefault(require("../../model/taskProgressModel"));
const quizConfig_1 = __importDefault(require("../../config/quizConfig"));
// Single-select question types: at most one option may be selected and the
// selection must be the single option flagged as the answer.
const SINGLE_SELECT_TYPES = ['RADIO', 'DROPDOWN', 'TOGGLE'];
/**
 * Same derivation getQuizById uses when handing options out: prefer a real
 * option `_id` when one exists, otherwise the stable `opt-{index}` position in
 * the persisted array. Submitted ids are resolved back through this map, so
 * shuffled display order is irrelevant.
 */
const buildOptionIdToIndex = (options) => {
    const map = new Map();
    (options || []).forEach((option, index) => {
        const optionId = option && option._id != null ? String(option._id) : `opt-${index}`;
        map.set(optionId, index);
    });
    return map;
};
const sameIdSet = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    const setA = new Set(a);
    return b.every(id => setA.has(id));
};
/**
 * Scores one option-based question. An unanswered scored question counts as
 * incorrect; CHECKBOX requires exact set equality with the full answer key, so
 * partial matches and incorrect extras both score zero.
 */
const gradeOptionQuestion = (type, correctIndexes, selectedIndexes) => {
    if (selectedIndexes.length === 0) {
        return false;
    }
    if (type === 'CHECKBOX') {
        return sameIdSet(selectedIndexes.map(String), correctIndexes.map(String));
    }
    // RADIO / DROPDOWN / TOGGLE: the selection must be exactly the one
    // correct option (payload validation already caps these at one id).
    return (correctIndexes.length === 1 &&
        selectedIndexes.length === 1 &&
        selectedIndexes[0] === correctIndexes[0]);
};
/**
 * Validates the employee's quiz answers against the stored answer key and
 * returns the score plus a per-question review. The attempt is located through
 * the employee's own task-progress row, so an attempt can only be validated by
 * the employee who started it. The score is persisted on the attempt itself so
 * submitQuiz can finalize the same result; revalidating before finalization
 * simply overwrites the snapshot. Finalized attempts (submittedAt set) are
 * rejected. Nothing here touches isCompleted — completion stays with submitQuiz
 * / updateMyTaskProgress.
 */
const validateQuiz = async (taskId, attemptId, answers, employeeId) => {
    var _a;
    if (!taskId || !mongoose_1.Types.ObjectId.isValid(taskId)) {
        return { success: false, invalidTaskId: true };
    }
    if (!attemptId || !mongoose_1.Types.ObjectId.isValid(attemptId)) {
        return { success: false, invalidAttemptId: true };
    }
    if (!Array.isArray(answers)) {
        return { success: false, invalidAnswers: true };
    }
    try {
        const task = await courseTaskModel_1.default.findById(taskId)
            .select('moduleId type')
            .lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if (String(task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }
        // The assignment scoping that proves ownership of the attempt: the
        // employee must have an assignment for the course that owns the task.
        const parentModule = await coursemoduleModel_1.default.findById(task.moduleId)
            .select('courseId')
            .lean();
        if (!parentModule || !parentModule.courseId) {
            return { success: false, notFound: true };
        }
        const assignment = await courseAssignmentModel_1.default.findOne({
            courseId: parentModule.courseId,
            employeeId
        }).lean();
        if (!assignment) {
            return { success: false, notFound: true };
        }
        // The attempt must live on THIS employee's progress row for THIS task.
        const progress = await taskProgressModel_1.default.findOne({
            courseAssignmentId: assignment._id,
            moduleId: parentModule._id,
            taskId
        })
            .select('quizAttempts')
            .lean();
        const attempt = ((progress === null || progress === void 0 ? void 0 : progress.quizAttempts) || []).find((entry) => String(entry._id) === String(attemptId));
        if (!attempt) {
            return { success: false, attemptNotFound: true };
        }
        if (attempt.submittedAt) {
            return { success: false, attemptAlreadyFinalized: true };
        }
        // Only published questions form the quiz the employee is answering.
        // Submitted question ids outside this set (hidden, deleted, or another
        // task's questions) are rejected below.
        const storedQuestions = await courseQuizQuestionModel_1.default.find({
            taskId,
            isDeleted: false,
            status: 'SHOW'
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();
        const questionsById = new Map(storedQuestions.map((question) => [String(question._id), question]));
        // Reject duplicate submissions up front, then resolve each answer.
        const seenQuestionIds = new Set();
        const submittedByQuestionId = new Map();
        for (const answer of answers) {
            const questionId = String((answer === null || answer === void 0 ? void 0 : answer.questionId) || '');
            if (!mongoose_1.Types.ObjectId.isValid(questionId)) {
                return { success: false, invalidAnswers: true };
            }
            if (seenQuestionIds.has(questionId)) {
                return { success: false, invalidAnswers: true };
            }
            seenQuestionIds.add(questionId);
            const question = questionsById.get(questionId);
            if (!question) {
                return { success: false, invalidAnswers: true };
            }
            const type = String(question.type || '').toUpperCase();
            const isTextarea = type === 'TEXTAREA';
            const selected = answer.selectedOptionIds;
            const textAnswer = answer.textAnswer;
            if (isTextarea) {
                // TEXTAREA is free text: an option selection on it is malformed.
                if ((selected !== undefined && !Array.isArray(selected)) ||
                    (Array.isArray(selected) && selected.length > 0) ||
                    (textAnswer !== undefined && typeof textAnswer !== 'string')) {
                    return { success: false, invalidAnswers: true };
                }
            }
            else {
                // Option-based questions must not carry a text answer.
                if (textAnswer !== undefined) {
                    return { success: false, invalidAnswers: true };
                }
                if (selected !== undefined && !Array.isArray(selected)) {
                    return { success: false, invalidAnswers: true };
                }
                const selectedIds = Array.isArray(selected) ? selected : [];
                if (selectedIds.some(id => typeof id !== 'string' || !id)) {
                    return { success: false, invalidAnswers: true };
                }
                // Every selected id must resolve to an option of THIS question.
                const optionIdToIndex = buildOptionIdToIndex(question.options);
                const resolvedIndexes = [];
                for (const optionId of selectedIds) {
                    const optionIndex = optionIdToIndex.get(optionId);
                    if (optionIndex === undefined) {
                        return { success: false, invalidAnswers: true };
                    }
                    resolvedIndexes.push(optionIndex);
                }
                // No option may be selected twice.
                if (new Set(resolvedIndexes).size !== resolvedIndexes.length) {
                    return { success: false, invalidAnswers: true };
                }
                if (SINGLE_SELECT_TYPES.includes(type) &&
                    resolvedIndexes.length > 1) {
                    return { success: false, invalidAnswers: true };
                }
            }
            submittedByQuestionId.set(questionId, answer);
        }
        // Grade every published question; omitted answers count as incorrect.
        const review = [];
        let totalScoredQuestions = 0;
        let correctAnswers = 0;
        for (const question of storedQuestions) {
            const questionId = String(question._id);
            const type = String(question.type || '').toUpperCase();
            const submitted = submittedByQuestionId.get(questionId);
            if (type === 'TEXTAREA') {
                review.push({
                    questionId,
                    question: question.question,
                    type,
                    isCorrect: null,
                    textAnswer: (_a = submitted === null || submitted === void 0 ? void 0 : submitted.textAnswer) !== null && _a !== void 0 ? _a : ''
                });
                continue;
            }
            totalScoredQuestions += 1;
            const options = Array.isArray(question.options) ? question.options : [];
            const optionIdToIndex = buildOptionIdToIndex(options);
            const correctIndexes = [];
            options.forEach((option, index) => {
                if (option && option.isanswer === true) {
                    correctIndexes.push(index);
                }
            });
            const selectedIds = Array.isArray(submitted === null || submitted === void 0 ? void 0 : submitted.selectedOptionIds) ? submitted.selectedOptionIds : [];
            const selectedIndexes = selectedIds.map(id => optionIdToIndex.get(id));
            const isCorrect = gradeOptionQuestion(type, correctIndexes, selectedIndexes);
            if (isCorrect) {
                correctAnswers += 1;
            }
            review.push({
                questionId,
                question: question.question,
                type,
                isCorrect,
                correctOptionIds: correctIndexes.map(index => options[index] && options[index]._id != null
                    ? String(options[index]._id)
                    : `opt-${index}`),
                correctOptionValues: correctIndexes.map(index => { var _a, _b; return (_b = (_a = options[index]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ''; }),
                selectedOptionIds: selectedIds,
                selectedOptionValues: selectedIndexes.map(index => { var _a, _b; return (_b = (_a = options[index]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ''; })
            });
        }
        const passingPercentage = quizConfig_1.default.getQuizPassingPercentage();
        // Zero scored questions (e.g. a TEXTAREA-only quiz) is a defined
        // unscored result — never NaN.
        const percentage = totalScoredQuestions > 0
            ? Math.round((correctAnswers / totalScoredQuestions) * 100)
            : null;
        const passed = percentage === null ? null : percentage >= passingPercentage;
        // Persist the score snapshot on the attempt so submitQuiz finalizes
        // exactly this result. A filtered positional update (`$[attempt]`) is
        // used because the target element is identified by two conditions
        // (its _id and submittedAt still null); the plain `$` operator is
        // ambiguous with multiple conditions on the same array and can write
        // to the wrong attempt when the row holds several attempts. Revalidating
        // before finalization overwrites the snapshot cleanly; the submittedAt
        // guard rejects already-finalized attempts.
        const now = new Date();
        const updateResult = await taskProgressModel_1.default.updateOne({ _id: progress._id }, {
            $set: {
                'quizAttempts.$[attempt].validatedAt': now,
                'quizAttempts.$[attempt].totalScoredQuestions': totalScoredQuestions,
                'quizAttempts.$[attempt].correctAnswers': correctAnswers,
                'quizAttempts.$[attempt].percentage': percentage,
                'quizAttempts.$[attempt].passed': passed
            }
        }, {
            arrayFilters: [
                { 'attempt._id': attemptId, 'attempt.submittedAt': null }
            ]
        });
        // Nothing modified => the attempt was finalized between our read and
        // this write (the array filter no longer matches).
        if (!updateResult || updateResult.modifiedCount === 0) {
            return { success: false, attemptAlreadyFinalized: true };
        }
        return {
            success: true,
            taskId,
            attemptId,
            totalScoredQuestions,
            correctAnswers,
            incorrectAnswers: totalScoredQuestions - correctAnswers,
            percentage,
            passingPercentage,
            passed,
            review
        };
    }
    catch (error) {
        console.error(`Error in validating quiz for task ${taskId}: ${error}`);
        return { success: false };
    }
};
exports.default = { validateQuiz };
