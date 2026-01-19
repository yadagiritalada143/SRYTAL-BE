"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseTaskService_1 = __importDefault(require("../../services/contentwriter/addCourseTaskService"));
const coursetaskMessages_1 = require("../../constants/contentwriter/coursetaskMessages");
const addTaskToModule = (req, res) => {
    const { moduleId, taskName, taskDescription, thumbnail } = req.body;
    const status = 'ACTIVE';
    addCourseTaskService_1.default
        .addCourseTaskService(moduleId, taskName, taskDescription, thumbnail, status)
        .then((responseAfteraddingCourseTask) => {
        if (responseAfteraddingCourseTask.id) {
            return res
                .status(201)
                .json({ message: coursetaskMessages_1.COURSE_TASK_SUCCESS_MESSAGES.COURSE_TASK_ADD_SUCCESS_MESSAGE });
        }
        else {
            return res
                .status(400)
                .json({ message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_ADD_ERROR_MESSAGE });
        }
    })
        .catch((error) => {
        console.log(error);
    });
};
exports.default = { addTaskToModule };
