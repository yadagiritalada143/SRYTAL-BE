"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
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
        return {
            success: true,
            coursedata: course
        };
    }
    catch (error) {
        console.error(`Error in fetching course By id: ${error}`);
        return { success: false };
    }
};
exports.default = { getCourseById };
