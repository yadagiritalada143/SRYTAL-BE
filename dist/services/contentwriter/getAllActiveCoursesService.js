"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const manageCourseMedia_1 = __importDefault(require("../../util/manageCourseMedia"));
const AllActiveCourses = async () => {
    try {
        const courses = await coursesModel_1.default.find({ status: 'ACTIVE' });
        const coursesWithThumbnailUrl = await Promise.all(courses.map(async (course) => {
            let thumbnailUrl = '';
            if (course.thumbnail) {
                thumbnailUrl =
                    await manageCourseMedia_1.default.getCourseMediaSignedUrl(course.thumbnail);
            }
            return Object.assign(Object.assign({}, course.toObject()), { thumbnailUrl });
        }));
        return { courses: coursesWithThumbnailUrl, totalActiveCourses: coursesWithThumbnailUrl.length };
    }
    catch (error) {
        console.error(`Error in getting all active courses: ${error}`);
        throw error;
    }
};
exports.default = { AllActiveCourses };
