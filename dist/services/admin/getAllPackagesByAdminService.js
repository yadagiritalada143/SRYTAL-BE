"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packageModel_1 = __importDefault(require("../../model/packageModel"));
const taskModel_1 = __importDefault(require("../../model/taskModel"));
const getAllPackagesWithTasksByAdmin = async () => {
    try {
        const packagesList = await packageModel_1.default.find({ isDeleted: false })
            .populate('approvers', 'firstName lastName')
            .lean();
        if (!packagesList || packagesList.length === 0) {
            return { success: false, packagesList: [] };
        }
        const packageIds = packagesList.map((pkg) => pkg._id);
        const taskDetails = await taskModel_1.default.find({
            packageId: { $in: packageIds },
            isDeleted: false
        })
            .populate('createdBy', 'firstName lastName')
            .lean();
        const tasksGroupedByPackage = taskDetails.reduce((acc, task) => {
            var _a;
            const packageIdKey = (_a = task.packageId) === null || _a === void 0 ? void 0 : _a.toString();
            if (packageIdKey) {
                if (!acc[packageIdKey]) {
                    acc[packageIdKey] = [];
                }
                acc[packageIdKey].push(task);
            }
            return acc;
        }, {});
        const packagesWithTasks = packagesList.map((pkg) => (Object.assign(Object.assign({}, pkg), { tasks: tasksGroupedByPackage[pkg._id.toString()] || [] })));
        return {
            success: true,
            packagesList: packagesWithTasks
        };
    }
    catch (error) {
        console.error(`Error in fetching all packages with tasks: ${error}`);
        return { success: false };
    }
};
exports.default = { getAllPackagesWithTasksByAdmin };
