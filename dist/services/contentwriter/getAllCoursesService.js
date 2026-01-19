"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursesModel_1 = __importDefault(require("../../model/coursesModel"));
const AllCoursesService = () => {
    return new Promise((resolve, reject) => {
        coursesModel_1.default.find({})
            .populate({
            path: 'modules',
            populate: {
                path: 'tasks',
                model: 'CourseTaskModel'
            }
        })
            .then((courses) => {
            if (!courses) {
                reject({ success: false });
            }
            else {
                resolve({
                    success: true,
                    courses: courses
                });
            }
        })
            .catch((error) => {
            console.error(`Error in fetching Courses: ${error}`);
            reject({ success: false });
        });
    });
};
exports.default = { AllCoursesService };
