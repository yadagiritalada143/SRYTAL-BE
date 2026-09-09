"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const s3Client_1 = __importDefault(require("../../util/s3Client"));
const awsS3Config_1 = require("../../config/awsS3Config");
const updateCourse = async (id, courseName, courseDescription, thumbnail, status) => {
    try {
        const existingCourse = await coursesModel_1.default.findById(id);
        if (!existingCourse) {
            return { success: false, responseAfterUpdateCourse: 'Course not found' };
        }
        const updateFields = { courseName, courseDescription, status };
        if (thumbnail) {
            updateFields.thumbnail = thumbnail;
            if (existingCourse.thumbnail) {
                await s3Client_1.default.deleteObject({ Bucket: awsS3Config_1.bucketName, Key: existingCourse.thumbnail })
                    .promise()
                    .catch((error) => console.error(`Error deleting old thumbnail from S3: ${error}`));
            }
        }
        const result = await coursesModel_1.default.updateOne({ _id: id }, updateFields);
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterUpdateCourse: result };
    }
    catch (error) {
        console.error(`Error in updating Course: ${error}`);
        return { success: false, responseAfterUpdateCourse: error };
    }
};
exports.default = { updateCourse };
