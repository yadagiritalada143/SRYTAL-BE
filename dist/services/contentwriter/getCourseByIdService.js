"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const courseOrdering_1 = require("../../constants/courseOrdering");
const getCourseById = async (id) => {
    var _a, _b, _c, _d;
    try {
        const course = await coursesModel_1.default.findById(id)
            .populate({
            path: 'modules',
            options: { sort: courseOrdering_1.COURSE_MODULE_CREATION_ORDER },
            populate: {
                path: 'tasks',
                model: 'CourseTaskModel',
                options: { sort: courseOrdering_1.COURSE_TASK_CREATION_ORDER }
            }
        });
        if (!course) {
            return { success: false };
        }
        const courseData = course.toObject();
        courseData.thumbnailUrl = course.thumbnail
            ? await manageCourseMedia_1.default.getCourseMediaSignedUrl(course.thumbnail)
            : '';
        let totalModules = 0;
        let totalTasks = 0;
        let totalActiveModules = 0;
        let totalArchivedModules = 0;
        let totalActiveTasks = 0;
        let totalArchivedTasks = 0;
        if (Array.isArray(courseData.modules)) {
            totalModules = courseData.modules.length;
            for (const module of courseData.modules) {
                module.thumbnailUrl = module.thumbnail
                    ? await manageCourseMedia_1.default.getCourseMediaSignedUrl(module.thumbnail)
                    : '';
                if (((_a = module.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'ACTIVE')
                    totalActiveModules++;
                else if (((_b = module.status) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === 'ARCHIVE')
                    totalArchivedModules++;
                if (Array.isArray(module.tasks)) {
                    totalTasks += module.tasks.length;
                    for (const task of module.tasks) {
                        task.thumbnailUrl = task.thumbnail
                            ? await manageCourseMedia_1.default.getCourseMediaSignedUrl(task.thumbnail)
                            : '';
                        if (((_c = task.status) === null || _c === void 0 ? void 0 : _c.toUpperCase()) === 'ACTIVE')
                            totalActiveTasks++;
                        else if (((_d = task.status) === null || _d === void 0 ? void 0 : _d.toUpperCase()) === 'ARCHIVE')
                            totalArchivedTasks++;
                    }
                }
            }
        }
        return {
            success: true,
            coursedata: courseData,
            totals: {
                totalModules,
                totalTasks,
                totalActiveModules,
                totalArchivedModules,
                totalActiveTasks,
                totalArchivedTasks
            }
        };
    }
    catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};
exports.default = { getCourseById };
