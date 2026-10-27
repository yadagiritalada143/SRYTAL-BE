"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const courseOrdering_1 = require("../../constants/courseOrdering");
const AllCourses = async () => {
    var _a, _b, _c, _d;
    try {
        const courses = await coursesModel_1.default.find()
            .populate({
            path: 'modules',
            options: { sort: courseOrdering_1.COURSE_MODULE_CREATION_ORDER },
            populate: {
                path: 'tasks',
                model: 'CourseTaskModel',
                options: { sort: courseOrdering_1.COURSE_TASK_CREATION_ORDER }
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
        const totalCourses = coursesWithThumbnailUrl.length;
        let totalModules = 0;
        let totalTasks = 0;
        let totalActiveModules = 0;
        let totalArchivedModules = 0;
        let totalActiveTasks = 0;
        let totalArchivedTasks = 0;
        const totalActiveCourses = coursesWithThumbnailUrl.filter((course) => { var _a; return ((_a = course.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'ACTIVE'; }).length;
        const totalArchivedCourses = coursesWithThumbnailUrl.filter((course) => { var _a; return ((_a = course.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'ARCHIVE'; }).length;
        for (const course of coursesWithThumbnailUrl) {
            const modules = Array.isArray(course.modules) ? course.modules : [];
            totalModules += modules.length;
            for (const module of modules) {
                if (((_a = module.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'ACTIVE')
                    totalActiveModules++;
                else if (((_b = module.status) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === 'ARCHIVE')
                    totalArchivedModules++;
                const tasks = Array.isArray(module.tasks) ? module.tasks : [];
                totalTasks += tasks.length;
                for (const task of tasks) {
                    if (((_c = task.status) === null || _c === void 0 ? void 0 : _c.toUpperCase()) === 'ACTIVE')
                        totalActiveTasks++;
                    else if (((_d = task.status) === null || _d === void 0 ? void 0 : _d.toUpperCase()) === 'ARCHIVE')
                        totalArchivedTasks++;
                }
            }
        }
        return { courses: coursesWithThumbnailUrl,
            totals: {
                totalCourses,
                totalModules,
                totalTasks,
                totalActiveCourses,
                totalArchivedCourses,
                totalActiveModules,
                totalArchivedModules,
                totalActiveTasks,
                totalArchivedTasks
            }
        };
    }
    catch (error) {
        console.error('Error in getting all courses:', error);
        throw error;
    }
};
exports.default = { AllCourses };
