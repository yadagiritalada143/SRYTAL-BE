"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const updateCourseTask = async (id, taskName, taskDescription, newThumbnail, status, newContent, newContentMimeType, newContentFileName) => {
    try {
        // const result = await CourseTaskModel.updateMany({ _id: id }, { taskName,  taskDescription, thumbnail, status });
        // if (!result) {
        //     return { success: false };
        // }
        // return { success: true, responseAfterUpdate: result };
        const existingTask = await courseTaskModel_1.default.findById(id);
        if (!existingTask) {
            return {
                success: false,
            };
        }
        const oldThumbnail = existingTask.thumbnail;
        const oldContent = existingTask.content;
        const updateData = {
            taskName,
            taskDescription,
            status,
        };
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
        const updatedTask = await courseTaskModel_1.default.findByIdAndUpdate(id, {
            $set: updateData,
        }, {
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
