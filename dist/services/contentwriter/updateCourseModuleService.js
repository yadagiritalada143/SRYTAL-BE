"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const s3Client_1 = __importDefault(require("../../util/s3Client"));
const awsS3Config_1 = require("../../config/awsS3Config");
const updateCourseModule = async (id, moduleName, moduleDescription, thumbnail, status) => {
    try {
        const existingCourseModule = await coursemoduleModel_1.default.findById(id);
        if (!existingCourseModule) {
            return { success: false, responseAfterModuleUpdate: 'Course module not found' };
        }
        const updateFields = { moduleName, moduleDescription, status };
        if (thumbnail) {
            updateFields.thumbnail = thumbnail;
            if (existingCourseModule.thumbnail) {
                await s3Client_1.default.deleteObject({ Bucket: awsS3Config_1.bucketName, Key: existingCourseModule.thumbnail })
                    .promise()
                    .catch((error) => console.error(`Error deleting old thumbnail from S3: ${error}`));
            }
        }
        const result = await coursemoduleModel_1.default.updateOne({ _id: id }, updateFields);
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterModuleUpdate: result };
    }
    catch (error) {
        console.error(`Error in updating module: ${error}`);
        return { success: false, responseAfterModuleUpdate: error };
    }
};
exports.default = { updateCourseModule };
