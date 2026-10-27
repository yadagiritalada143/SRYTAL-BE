"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursetaskMessages_1 = require("../constants/contentwriter/coursetaskMessages");
const addCourseTaskSchema_1 = __importDefault(require("./schemas/addCourseTaskSchema"));
const validateAddCourseTask = (req, res, next) => {
    var _a, _b, _c, _d;
    const files = req.files;
    const { error, value } = addCourseTaskSchema_1.default.validate(Object.assign(Object.assign({}, req.body), { taskFileUploaded: Boolean((_a = files === null || files === void 0 ? void 0 : files.taskFile) === null || _a === void 0 ? void 0 : _a[0]), hasThumbnail: Boolean((_b = files === null || files === void 0 ? void 0 : files.thumbnailFile) === null || _b === void 0 ? void 0 : _b[0]), thumbnailMimeType: (_d = (_c = files === null || files === void 0 ? void 0 : files.thumbnailFile) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.mimetype }), {
        abortEarly: false,
        stripUnknown: true
    });
    if (error) {
        res.status(400).json({
            success: false,
            message: coursetaskMessages_1.COURSE_TASK_ERRORS_MESSAGES.COURSE_TASK_VALIDATION_ERROR_MESSAGE,
            errors: error.details.map((detail) => detail.message)
        });
        return;
    }
    req.body = value;
    next();
};
exports.default = validateAddCourseTask;
