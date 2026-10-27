"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const courseQuizQuestionModel_1 = __importDefault(require("../../model/courseQuizQuestionModel"));
const taskProgressModel_1 = __importDefault(require("../../model/taskProgressModel"));
/** Fisher-Yates shuffle that never mutates the input array. */
const shuffle = (items) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
/**
 * Converts a stored question into the employee-facing view model. The correct
 * answer flag is never copied across — only `optionId` and `value` leave the
 * service. Option ids are derived from the option's index in the persisted
 * array (`opt-0`, `opt-1`, ...), so they stay stable across shuffles and
 * attempts even though the stored options carry no `_id` of their own.
 */
const toQuizQuestion = (question) => {
    const type = String(question.type || '').toUpperCase();
    if (type === 'TEXTAREA' || !Array.isArray(question.options) || question.options.length === 0) {
        return {
            questionId: String(question._id),
            question: question.question,
            type
        };
    }
    const identifiedOptions = question.options.map((option, index) => ({
        optionId: option && option._id != null ? String(option._id) : `opt-${index}`,
        value: option ? option.value : ''
    }));
    return {
        questionId: String(question._id),
        question: question.question,
        type,
        options: shuffle(identifiedOptions)
    };
};
/**
 * Employee-facing quiz fetch. Serves only published questions (SHOW, not
 * deleted) of an ACTIVE QUIZ task that belongs to a course the employee is
 * actually assigned to — the same assignment scoping every other
 * "my courses" endpoint uses. Question order and option order are shuffled per
 * call; nothing is written back to the question documents. Each call with at
 * least one question mints a new quiz attempt on the existing task-progress
 * row (no separate collection) and returns its id, so an explicit reattempt
 * always gets a fresh randomization and a fresh attemptId.
 */
const getQuizById = async (taskId, employeeId) => {
    if (!taskId || !mongoose_1.Types.ObjectId.isValid(taskId)) {
        return { success: false, invalidTaskId: true };
    }
    try {
        const task = await courseTaskModel_1.default.findById(taskId)
            .select('moduleId taskName type status')
            .lean();
        if (!task) {
            return { success: false, taskNotFound: true };
        }
        if ((task.type || '').toUpperCase() !== 'QUIZ') {
            return { success: false, notQuizTask: true };
        }
        if ((task.status || '').toUpperCase() !== 'ACTIVE') {
            return { success: false, taskInactive: true };
        }
        const parentModule = await coursemoduleModel_1.default.findById(task.moduleId)
            .select('courseId')
            .lean();
        if (!parentModule || !parentModule.courseId) {
            return { success: false, notFound: true };
        }
        const [assignment, course] = await Promise.all([
            courseAssignmentModel_1.default.findOne({ courseId: parentModule.courseId, employeeId }).lean(),
            coursesModel_1.default.findById(parentModule.courseId).select('status').lean()
        ]);
        // Archived courses (and employees with no assignment for the course that
        // owns the task) may not reach the quiz.
        if (!assignment ||
            (course && String(course.status || '').toUpperCase() === 'ARCHIVE')) {
            return { success: false, notFound: true };
        }
        const storedQuestions = await courseQuizQuestionModel_1.default.find({
            taskId,
            isDeleted: false,
            status: 'SHOW'
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();
        const questions = shuffle(storedQuestions).map(toQuizQuestion);
        let attemptId;
        if (questions.length > 0) {
            const existingProgress = await taskProgressModel_1.default.findOne({
                courseAssignmentId: assignment._id,
                moduleId: parentModule._id,
                taskId
            })
                .select('quizAttempts')
                .lean();
            const attemptNumber = (((existingProgress === null || existingProgress === void 0 ? void 0 : existingProgress.quizAttempts) || []).length || 0) + 1;
            const attemptObjectId = new mongoose_1.Types.ObjectId();
            // Upsert keeps a single progress row per (assignment, module, task) —
            // the collection's unique index — and only the attempt list grows.
            // isCompleted is left untouched on resume, set to false on first insert.
            await taskProgressModel_1.default.findOneAndUpdate({
                courseAssignmentId: assignment._id,
                moduleId: parentModule._id,
                taskId
            }, {
                $setOnInsert: {
                    courseAssignmentId: assignment._id,
                    moduleId: parentModule._id,
                    taskId,
                    isCompleted: false,
                    completedAt: null
                },
                $push: {
                    quizAttempts: {
                        _id: attemptObjectId,
                        attemptNumber,
                        startedAt: new Date()
                    }
                }
            }, { upsert: true, new: true, setDefaultsOnInsert: true });
            attemptId = String(attemptObjectId);
        }
        return {
            success: true,
            taskId,
            attemptId,
            taskName: task.taskName,
            totalQuestions: questions.length,
            questions
        };
    }
    catch (error) {
        console.error(`Error in fetching quiz by id for task ${taskId}: ${error}`);
        return { success: false };
    }
};
exports.default = { getQuizById };
