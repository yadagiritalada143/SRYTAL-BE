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
const REMINDER_INTERVAL_DAYS = 3;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const startOfISTDay = (date) => {
    const ist = new Date(date.getTime() + IST_OFFSET_MS);
    ist.setUTCHours(0, 0, 0, 0);
    return new Date(ist.getTime() - IST_OFFSET_MS);
};
const daysBetweenISTDays = (from, to) => {
    return Math.round((startOfISTDay(to).getTime() - startOfISTDay(from).getTime()) / DAY_MS);
};
const isReminderDue = (assignment) => {
    const now = new Date();
    const reference = assignment.reminderScheduleStartDate || assignment.assignedAt;
    if (!reference) {
        return false;
    }
    if (assignment.lastReminderSentAt) {
        return daysBetweenISTDays(assignment.lastReminderSentAt, now) >= REMINDER_INTERVAL_DAYS;
    }
    return daysBetweenISTDays(reference, now) >= REMINDER_INTERVAL_DAYS;
};
const sendCourseReminders = async () => {
    try {
        const now = new Date();
        const incompleteAssignments = await courseAssignmentModel_1.default.find({
            status: { $ne: 'Completed' },
            dueDate: { $exists: true, $ne: null, $gte: now },
        })
            .populate({ path: 'courseId', model: coursesModel_1.default })
            .sort({ dueDate: 1 })
            .lean()
            .exec();
        const assignmentsDueForReminder = incompleteAssignments.filter(isReminderDue);
        if (!assignmentsDueForReminder || assignmentsDueForReminder.length === 0) {
            console.log('Course Reminder Cron: No incomplete assignments are due for a reminder.');
            return;
        }
        ;
        const employeeIds = assignmentsDueForReminder.map((assignment) => assignment.employeeId);
        const employees = await userModel_1.default.find({ _id: { $in: employeeIds } })
            .select('firstName lastName email')
            .lean();
        const employeeById = new Map(employees.map((employee) => [String(employee._id), employee]));
        for (const assignment of assignmentsDueForReminder) {
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
    console.warn('Course Reminder Cron: Triggered at 11:30 AM IST...');
    sendCourseReminders();
}, {
    timezone: 'Asia/Kolkata',
});
exports.default = { sendCourseReminders };
