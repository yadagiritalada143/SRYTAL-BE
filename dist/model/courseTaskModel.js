"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const CourseTaskSchema = new mongoose_1.default.Schema({
    moduleId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseModuleModel', required: true },
    taskName: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    taskDescription: { type: mongoose_1.default.Schema.Types.String },
    thumbnail: { type: mongoose_1.default.Schema.Types.String },
    status: { type: mongoose_1.default.Schema.Types.String },
}, {
    collection: 'coursetask',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
CourseTaskSchema.plugin(mongoose_unique_validator_1.default);
const CourseTaskModel = mongoose_1.default.model('CourseTaskModel', CourseTaskSchema);
exports.default = CourseTaskModel;
