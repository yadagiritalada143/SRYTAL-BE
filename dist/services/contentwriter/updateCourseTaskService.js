"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const stripHtmlTags_1 = require("../../util/stripHtmlTags");
const updateCourseTask = async (id, taskName, taskDescription, newThumbnail, status, newContent, newContentMimeType, newContentFileName, isCoding, question, executionMode, acknowledgementText, orderIdx) => {
    try {
        const existingTask = await courseTaskModel_1.default.findById(id);
        if (!existingTask) {
            return {
                success: false,
                responseAfterUpdate: 'COURSE_TASK_NOT_FOUND',
            };
        }
        if (orderIdx !== undefined) {
            if (!Number.isInteger(orderIdx) || orderIdx < 1) {
                return {
                    success: false,
                    responseAfterUpdate: 'COURSE_TASK_INVALID_ORDER_IDX'
                };
            }
            const taskWithSameOrderIdx = await courseTaskModel_1.default.findOne({
                moduleId: existingTask.moduleId,
                orderIdx,
                _id: { $ne: id }
            })
                .select('_id')
                .lean();
            if (taskWithSameOrderIdx) {
                return {
                    success: false,
                    responseAfterUpdate: 'COURSE_TASK_DUPLICATE_ORDER_IDX'
                };
            }
        }
        const taskWithSameName = await courseTaskModel_1.default.findOne({ taskName, _id: { $ne: id } });
        if (taskWithSameName) {
            return {
                success: false,
                responseAfterUpdate: 'COURSE_TASK_DUPLICATE_NAME'
            };
        }
        const cleanTaskDescription = (0, stripHtmlTags_1.stripHtmlTags)(taskDescription);
        const updateData = {
            taskName,
            taskDescription: cleanTaskDescription,
            status,
        };
        if (orderIdx !== undefined) {
            updateData.orderIdx = orderIdx;
        }
        if (acknowledgementText !== undefined) {
            const cleanAcknowledgementText = (0, stripHtmlTags_1.stripHtmlTags)(acknowledgementText);
            if (cleanAcknowledgementText &&
                String(existingTask.type || '').toUpperCase() !== 'FILE') {
                return {
                    success: false,
                    responseAfterUpdate: new Error('COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY')
                };
            }
            updateData.acknowledgementText = cleanAcknowledgementText;
        }
        if (executionMode) {
            if (String(existingTask.type || '').toUpperCase() !== 'CODE') {
                throw new Error('EXECUTION_MODE_REQUIRES_CODING_TASK');
            }
            updateData.executionMode = executionMode;
        }
        const codingQuestionChanged = String(existingTask.type || '').toUpperCase() === 'CODE' &&
            existingTask.taskDescription !== cleanTaskDescription;
        if (codingQuestionChanged) {
            updateData.starterCode = [];
        }
        if (newThumbnail) {
            updateData.thumbnail = newThumbnail;
        }
        if (newContent) {
            updateData.content = newContent;
            updateData.contentMimeType =
                newContentMimeType;
            updateData.contentFileName =
                newContentFileName;
        }
        const updatedTask = await courseTaskModel_1.default.findByIdAndUpdate(id, Object.assign({ $set: updateData }, (codingQuestionChanged
            ? { $unset: { baseBoilerplate: 1 } }
            : {})), {
            new: true,
            runValidators: true,
        });
        if (!updatedTask) {
            return {
                success: false,
            };
        }
        return {
            success: true,
            responseAfterUpdate: updatedTask,
        };
    }
    catch (error) {
        console.error(`Error in updating course task: ${error}`);
        return { success: false, responseAfterUpdate: error };
    }
};
exports.default = { updateCourseTask };
