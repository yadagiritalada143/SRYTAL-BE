"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const courseTaskBoilerplateService_1 = __importDefault(require("../common/courseTaskBoilerplateService"));
const stripHtmlTags_1 = require("../../util/stripHtmlTags");
const addCourseTask = async (moduleId, taskName, taskDescription, thumbnail, status, type, content, contentMimeType, contentFileName, userId, orderIdx, acknowledgementText) => {
    const isCodingTask = String(type || '').toUpperCase() === 'CODE';
    const cleanTaskDescription = (0, stripHtmlTags_1.stripHtmlTags)(taskDescription);
    const cleanAcknowledgementText = (0, stripHtmlTags_1.stripHtmlTags)(acknowledgementText !== null && acknowledgementText !== void 0 ? acknowledgementText : '');
    try {
        const existingTask = await courseTaskModel_1.default.findOne({
            moduleId,
            orderIdx
        })
            .select('_id')
            .lean();
        if (existingTask) {
            return {
                success: false,
                message: 'DUPLICATE_ORDER_IDX'
            };
        }
        let baseBoilerplate;
        if (isCodingTask) {
            try {
                baseBoilerplate = await courseTaskBoilerplateService_1.default.generateBaseBoilerplate(cleanTaskDescription, userId);
            }
            catch (error) {
                const errorCode = String((error === null || error === void 0 ? void 0 : error.message) || '');
                console.error(`Error generating coding task boilerplate: ${errorCode}`);
                if (errorCode === 'USER_OPENROUTER_KEY_NOT_FOUND' ||
                    errorCode === 'OPENROUTER_KEY_NOT_FOUND' ||
                    errorCode === 'OPENROUTER_KEY_INVALID' ||
                    errorCode === 'OPENROUTER_API_KEY_INVALID_FORMAT' ||
                    errorCode === 'CODING_TASK_DESCRIPTION_REQUIRED' ||
                    errorCode === 'COURSE_TASK_QUIZ_TASK_MESSAGE') {
                    throw error;
                }
                throw new Error('COURSE_TASK_BOILERPLATE_GENERATION_FAILED');
            }
        }
        const taskToSave = new courseTaskModel_1.default(Object.assign(Object.assign(Object.assign({ moduleId,
            taskName, taskDescription: cleanTaskDescription, thumbnail,
            status,
            type,
            content,
            contentMimeType,
            contentFileName,
            orderIdx }, (cleanAcknowledgementText ? { acknowledgementText: cleanAcknowledgementText } : {})), (baseBoilerplate ? { baseBoilerplate } : {})), (isCodingTask ? { executionMode: 'CALLABLE' } : {})));
        const result = await taskToSave.save();
        const module = await coursemoduleModel_1.default.findById(moduleId).lean();
        if (module === null || module === void 0 ? void 0 : module.courseId) {
            await coursesModel_1.default.findByIdAndUpdate(module.courseId, {
                $currentDate: {
                    updatedAt: true
                }
            });
        }
        return {
            success: true,
            data: result
        };
    }
    catch (error) {
        console.error(`Error in adding course task: ${error}`);
        throw error;
    }
};
exports.default = { addCourseTask };
