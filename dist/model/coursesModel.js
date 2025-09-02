"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const CoursesSchema = new mongoose_1.default.Schema({
    courseName: { type: mongoose_1.default.Schema.Types.String, unique: true },
    courseDescription: { type: mongoose_1.default.Schema.Types.String }
}, {
    collection: 'courses',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
CoursesSchema.plugin(mongoose_unique_validator_1.default);
const CourseModel = mongoose_1.default.model('CourseModel', CoursesSchema);
exports.default = CourseModel;
