"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseModuleService_1 = __importDefault(require("../../services/contentwriter/addCourseModuleService"));
const coursemoduleMessages_1 = require("../../constants/contentwriter/coursemoduleMessages");
const addModuleToCourse = (req, res) => {
    const { courseId, moduleName, moduleDescription, thumbnail } = req.body;
    const status = 'ACTIVE';
    addCourseModuleService_1.default
        .addNewCourseModuleService(courseId, moduleName, moduleDescription, thumbnail, status)
        .then((responseAfteraddingCourseModule) => {
        if (responseAfteraddingCourseModule.id) {
            return res
                .status(201)
                .json({ message: coursemoduleMessages_1.COURSE_MODULE_SUCCESS_MESSAGES.COURSE_MODULE_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res
                .status(400)
                .json({ message: coursemoduleMessages_1.COURSE_MODULE_ERRORS_MESSAGES.COURSE_MODULE_ADD_ERROR_MESSAGE });
        }
    })
        .catch((error) => {
        console.log(error);
    });
};
exports.default = { addModuleToCourse };
