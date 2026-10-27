"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userModel_1 = __importDefault(require("./userModel"));
const packageModel_1 = __importDefault(require("./packageModel"));
const TaskSchema = new mongoose_1.default.Schema({
    title: { type: mongoose_1.default.Schema.Types.String, required: true, unique: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default },
    createdAt: { type: mongoose_1.default.Schema.Types.Date },
    lastUpdatedAt: { type: mongoose_1.default.Schema.Types.Date },
    isDeleted: { type: mongoose_1.default.Schema.Types.Boolean },
    packageId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: packageModel_1.default },
}, {
    collection: 'tasks',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
TaskSchema.plugin(mongoose_unique_validator_1.default);
const TaskModel = mongoose_1.default.model('TaskModel', TaskSchema);
exports.default = TaskModel;
