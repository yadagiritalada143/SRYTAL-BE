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
    status: { type: mongoose_1.default.Schema.Types.String, enum: ['ACTIVE', 'ARCHIVE'], default: 'ACTIVE' },
    type: { type: mongoose_1.default.Schema.Types.String, enum: ['CODE', 'QUIZ', 'LINK', 'FILE'] },
    executionMode: { type: mongoose_1.default.Schema.Types.String, enum: ['CALLABLE', 'STDIN', 'UNCONFIGURED'], default: 'UNCONFIGURED' },
    content: { type: mongoose_1.default.Schema.Types.String },
    contentMimeType: { type: mongoose_1.default.Schema.Types.String },
    contentFileName: { type: mongoose_1.default.Schema.Types.String },
    acknowledgementText: { type: mongoose_1.default.Schema.Types.String, trim: true },
    baseBoilerplate: { type: mongoose_1.default.Schema.Types.String },
    boilerplateVersion: { type: mongoose_1.default.Schema.Types.Number, default: 0 },
    starterCode: [{
            languageId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'ProgrammingLanguagesSchema',
                required: true
            },
            code: { type: mongoose_1.default.Schema.Types.String, required: true },
        }],
    orderIdx: { type: mongoose_1.default.Schema.Types.Number, required: true, min: 1 }
}, {
    collection: 'coursetask',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
CourseTaskSchema.plugin(mongoose_unique_validator_1.default);
CourseTaskSchema.index({ moduleId: 1, createdAt: 1, _id: 1 });
const CourseTaskModel = mongoose_1.default.model('CourseTaskModel', CourseTaskSchema);
exports.default = CourseTaskModel;
