"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const getCourseById = async (id) => {
    try {
        const course = await coursesModel_1.default.findById(id)
            .populate({
            path: 'modules',
            populate: {
                path: 'tasks',
                model: 'CourseTaskModel'
            }
        });
        if (!course) {
            return { success: false };
        }
        const courseData = course.toObject();
        courseData.thumbnailUrl = course.thumbnail
            ? await manageCourseMedia_1.default.getCourseMediaSignedUrl(course.thumbnail)
            : '';
        if (Array.isArray(courseData.modules)) {
            for (const module of courseData.modules) {
                module.thumbnailUrl = module.thumbnail
                    ? await manageCourseMedia_1.default.getCourseMediaSignedUrl(module.thumbnail)
                    : '';
                if (Array.isArray(module.tasks)) {
                    for (const task of module.tasks) {
                        task.thumbnailUrl = task.thumbnail
                            ? await manageCourseMedia_1.default.getCourseMediaSignedUrl(task.thumbnail)
                            : '';
                    }
                }
            }
        }
        return {
            success: true,
            coursedata: courseData
        };
    }
    catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};
exports.default = { getCourseById };
