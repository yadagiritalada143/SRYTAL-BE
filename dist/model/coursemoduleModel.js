"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const CourseModuleSchema = new mongoose_1.default.Schema({
    moduleName: { type: mongoose_1.default.Schema.Types.String, unique: true },
    moduleDescription: { type: mongoose_1.default.Schema.Types.String },
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseModel' },
    thumbnail: { type: mongoose_1.default.Schema.Types.String },
    status: { type: mongoose_1.default.Schema.Types.String },
}, {
    collection: 'coursemodule',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
CourseModuleSchema.virtual('tasks', {
    ref: 'CourseTaskModel',
    localField: '_id',
    foreignField: 'moduleId',
});
CourseModuleSchema.plugin(mongoose_unique_validator_1.default);
const CourseModuleModel = mongoose_1.default.model('CourseModule', CourseModuleSchema);
exports.default = CourseModuleModel;
