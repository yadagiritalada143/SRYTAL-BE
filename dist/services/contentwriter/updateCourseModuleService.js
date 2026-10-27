"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const s3Client_1 = __importDefault(require("../../util/s3Client"));
const awsS3Config_1 = require("../../config/awsS3Config");
const stripHtmlTags_1 = require("../../util/stripHtmlTags");
const updateCourseModule = async (id, moduleName, moduleDescription, thumbnail, status, orderIdx) => {
    try {
        const existingCourseModule = await coursemoduleModel_1.default.findById(id);
        if (!existingCourseModule) {
            return { success: false, responseAfterModuleUpdate: 'Course module not found' };
        }
        const existingModuleWithOrderIdx = await coursemoduleModel_1.default.findOne({
            courseId: existingCourseModule.courseId,
            orderIdx,
            _id: { $ne: id }
        });
        if (existingModuleWithOrderIdx) {
            return {
                success: false,
                message: 'DUPLICATE_ORDER_IDX'
            };
        }
        const courseModuleWithSameName = await coursemoduleModel_1.default.findOne({ moduleName, _id: { $ne: id } });
        if (courseModuleWithSameName) {
            return { success: false, responseAfterModuleUpdate: 'COURSE_MODULE_DUPLICATE_NAME' };
        }
        const updateFields = { moduleName, moduleDescription: (0, stripHtmlTags_1.stripHtmlTags)(moduleDescription), status, orderIdx };
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
