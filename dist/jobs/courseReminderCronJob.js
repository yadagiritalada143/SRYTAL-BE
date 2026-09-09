"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const courseAssignmentModel_1 = __importDefault(require("../model/courseAssignmentModel"));
const coursesModel_1 = __importDefault(require("../model/coursesModel"));
const userModel_1 = __importDefault(require("../model/userModel"));
const sendCourseReminderEmail_1 = __importDefault(require("../util/sendCourseReminderEmail"));
const sendCourseReminders = async () => {
    try {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const incompleteAssignments = await courseAssignmentModel_1.default.find({
            status: { $ne: 'Completed' },
            dueDate: { $exists: true, $ne: null, $gte: now },
            $or: [
                { lastReminderSentAt: null },
                { lastReminderSentAt: { $lte: threeDaysAgo } },
            ],
        })
            .populate({ path: 'courseId', model: coursesModel_1.default })
            .sort({ dueDate: 1 })
            .lean()
            .exec();
        if (!incompleteAssignments || incompleteAssignments.length === 0) {
            console.log('Course Reminder Cron: No incomplete assignments with valid due dates found.');
            return;
        }
        ;
        const employeeIds = incompleteAssignments.map((assignment) => assignment.employeeId);
        const employees = await userModel_1.default.find({ _id: { $in: employeeIds } })
            .select('firstName lastName email')
            .lean();
        const employeeById = new Map(employees.map((employee) => [String(employee._id), employee]));
        for (const assignment of incompleteAssignments) {
            try {
                const employee = employeeById.get(String(assignment.employeeId));
                const course = assignment.courseId;
                if (!employee || !employee.email || !course || !course.courseName) {
                    continue;
                }
                const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email;
                await sendCourseReminderEmail_1.default.sendCourseReminderEmail({
                    employeeName,
                    employeeEmail: employee.email,
                    courseName: course.courseName,
                    dueDate: assignment.dueDate,
                });
                await courseAssignmentModel_1.default.findByIdAndUpdate(assignment._id, {
                    lastReminderSentAt: new Date(),
                });
            }
            catch (emailError) {
                console.error(`Course Reminder Cron: Failed to send reminder for assignment ${assignment._id} — ${emailError.message}`);
            }
        }
    }
    catch (error) {
        console.error(`Course Reminder Cron: Error running reminder job — ${error.message}`);
    }
};
node_cron_1.default.schedule('30 11 * * *', () => {
    console.warn('Course Reminder Cron: Triggered at 11:30 AM...');
    sendCourseReminders();
});
exports.default = { sendCourseReminders };
