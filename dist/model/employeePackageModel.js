"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
const userModel_1 = __importDefault(require("./userModel"));
const packageModel_1 = __importDefault(require("./packageModel"));
const taskModel_1 = __importDefault(require("./taskModel"));
const EmployeePackagesSchema = new mongoose_1.default.Schema({
    employeeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: userModel_1.default },
    packages: [{
            packageId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: packageModel_1.default },
            tasks: [{
                    taskId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: taskModel_1.default },
                    timesheet: [{
                            date: { type: mongoose_1.default.Schema.Types.Date },
                            isHoliday: { type: mongoose_1.default.Schema.Types.Boolean },
                            isVacation: { type: mongoose_1.default.Schema.Types.Boolean },
                            isWeekOff: { type: mongoose_1.default.Schema.Types.Boolean },
                            hours: { type: mongoose_1.default.Schema.Types.Number },
                            comments: { type: mongoose_1.default.Schema.Types.String },
                            leaveReason: { type: mongoose_1.default.Schema.Types.String },
                            status: { type: mongoose_1.default.Schema.Types.String }
                        }]
                }]
        }]
}, {
    collection: 'employee-packages',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
EmployeePackagesSchema.plugin(mongoose_unique_validator_1.default);
const EmployeePackageModel = mongoose_1.default.model('EmployeePackageModel', EmployeePackagesSchema);
exports.default = EmployeePackageModel;
