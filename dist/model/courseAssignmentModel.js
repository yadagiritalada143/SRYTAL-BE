"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const CourseAssignmentSchema = new mongoose_1.default.Schema({
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CourseModel', required: true, index: true },
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'userModel', required: true, index: true },
    assignedByAdminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'userModel', required: true },
    status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned', required: true },
    assignedAt: { type: Date, default: Date.now, required: true },
    dueDate: { type: Date, default: Date.now, required: true },
    completedAt: { type: Date, default: null },
    lastReminderSentAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    collection: 'course-assignments',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
CourseAssignmentSchema.index({
    courseId: 1,
    employeeId: 1,
}, {
    unique: true,
});
CourseAssignmentSchema.plugin(mongoose_unique_validator_1.default);
const CourseAssignment = mongoose_1.default.model('CourseAssignment', CourseAssignmentSchema);
exports.default = CourseAssignment;
