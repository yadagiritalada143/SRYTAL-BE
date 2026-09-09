"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const AllCourses = async () => {
    try {
        const courses = await coursesModel_1.default.find()
            .populate({
            path: 'modules',
            populate: {
                path: 'tasks',
                model: 'CourseTaskModel'
            }
        });
        const coursesWithThumbnailUrl = await Promise.all(courses.map(async (course) => {
            let thumbnailUrl = '';
            if (course.thumbnail) {
                thumbnailUrl =
                    await manageCourseMedia_1.default.getCourseMediaSignedUrl(course.thumbnail);
            }
            const courseData = course.toObject();
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
            return Object.assign(Object.assign({}, courseData), { thumbnailUrl });
        }));
        let totalCourses = coursesWithThumbnailUrl.length;
        let totalModules = 0;
        let totalTasks = 0;
        for (const course of coursesWithThumbnailUrl) {
            const modules = Array.isArray(course.modules) ? course.modules : [];
            totalModules += modules.length;
            for (const module of modules) {
                totalTasks += Array.isArray(module.tasks) ? module.tasks.length : 0;
            }
        }
        return {
            courses: coursesWithThumbnailUrl,
            totals: { totalCourses, totalModules, totalTasks },
        };
    }
    catch (error) {
        console.error('Error in getting all courses:', error);
        throw error;
    }
};
exports.default = { AllCourses };
