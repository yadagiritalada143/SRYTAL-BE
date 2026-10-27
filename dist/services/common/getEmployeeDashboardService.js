"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employeePackageModel_1 = __importDefault(require("../../model/employeePackageModel"));
const userModel_1 = __importDefault(require("../../model/userModel"));
/**
 * Aggregates a single employee's at-a-glance dashboard data:
 *  - profile summary (name, designation, department, tenure)
 *  - timesheet stats for the current month / week
 *  - active projects with hours logged this month
 *  - recent timesheet entries
 *
 * All timesheet data lives in a single employee-packages document per employee
 * (packages -> tasks -> timesheet[]), so we fetch it populated and reduce in JS,
 * consistent with employeePackageDetailsByIdService.
 */
const TIMESHEET_STATUS = {
    APPROVED: 'Approved',
    WAITING: 'Waiting For Approval',
    REJECTED: 'Rejected',
    NOT_SUBMITTED: 'Not Submitted'
};
const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};
// Monday as the first day of the week.
const startOfWeek = (d) => {
    const x = startOfDay(d);
    const day = x.getDay();
    const diff = day === 0 ? 6 : day - 1;
    x.setDate(x.getDate() - diff);
    return x;
};
const monthsBetween = (from, to) => {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate())
        months -= 1;
    return Math.max(0, months);
};
const formatTenure = (doj) => {
    if (!doj)
        return null;
    const d = new Date(doj);
    if (isNaN(d.getTime()))
        return null;
    const months = monthsBetween(d, new Date());
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    const parts = [];
    if (years > 0)
        parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    parts.push(`${remMonths} mo${remMonths !== 1 ? 's' : ''}`);
    return parts.join(' ');
};
const getEmployeeDashboard = async (userId) => {
    var _a, _b;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const weekStart = startOfWeek(now);
    const [employee, employeePackages] = await Promise.all([
        userModel_1.default.findById(userId)
            .populate('employeeRole')
            .populate('employmentType')
            .populate('department')
            .lean(),
        employeePackageModel_1.default.find({ employeeId: userId })
            .populate('packages.packageId')
            .populate('packages.tasks.taskId')
            .lean()
    ]);
    let hoursThisMonth = 0;
    let hoursThisWeek = 0;
    const daysLogged = new Set();
    const statusCounts = { approved: 0, waiting: 0, rejected: 0, notSubmitted: 0 };
    const projectMap = new Map();
    const taskIds = new Set();
    const recentEntries = [];
    for (const empPkg of employeePackages || []) {
        for (const pkg of empPkg.packages || []) {
            const project = pkg.packageId || {};
            const projectId = String(project._id || pkg.packageId || Math.random());
            const projectTitle = project.title || 'Untitled Project';
            if (!projectMap.has(projectId)) {
                projectMap.set(projectId, { title: projectTitle, hours: 0, endDate: project.endDate });
            }
            for (const task of pkg.tasks || []) {
                const taskDoc = task.taskId || {};
                if (taskDoc._id)
                    taskIds.add(String(taskDoc._id));
                const taskTitle = taskDoc.title || 'Untitled Task';
                for (const ts of (task.timesheet || [])) {
                    const tsDate = ts.date ? new Date(ts.date) : null;
                    const hours = Number(ts.hours) || 0;
                    // Status tally (all-time, gives a sense of pending work).
                    switch (ts.status) {
                        case TIMESHEET_STATUS.APPROVED:
                            statusCounts.approved += 1;
                            break;
                        case TIMESHEET_STATUS.WAITING:
                            statusCounts.waiting += 1;
                            break;
                        case TIMESHEET_STATUS.REJECTED:
                            statusCounts.rejected += 1;
                            break;
                        case TIMESHEET_STATUS.NOT_SUBMITTED:
                            statusCounts.notSubmitted += 1;
                            break;
                    }
                    if (tsDate && !isNaN(tsDate.getTime())) {
                        if (tsDate >= monthStart && tsDate < monthEnd) {
                            hoursThisMonth += hours;
                            if (hours > 0)
                                daysLogged.add(startOfDay(tsDate).toISOString());
                            const proj = projectMap.get(projectId);
                            if (proj)
                                proj.hours += hours;
                        }
                        if (tsDate >= weekStart) {
                            hoursThisWeek += hours;
                        }
                        if (hours > 0) {
                            recentEntries.push({
                                date: tsDate,
                                hours,
                                status: ts.status || TIMESHEET_STATUS.NOT_SUBMITTED,
                                taskTitle,
                                projectTitle,
                                comments: ts.comments || ''
                            });
                        }
                    }
                }
            }
        }
    }
    recentEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
    const projects = Array.from(projectMap.values())
        .sort((a, b) => b.hours - a.hours);
    const designation = Array.isArray(employee === null || employee === void 0 ? void 0 : employee.employeeRole) && (employee === null || employee === void 0 ? void 0 : employee.employeeRole.length)
        ? (employee === null || employee === void 0 ? void 0 : employee.employeeRole).map(r => r.designation).filter(Boolean).join(', ')
        : null;
    return {
        success: true,
        profile: {
            firstName: (employee === null || employee === void 0 ? void 0 : employee.firstName) || '',
            lastName: (employee === null || employee === void 0 ? void 0 : employee.lastName) || '',
            employeeId: (employee === null || employee === void 0 ? void 0 : employee.employeeId) || null,
            designation,
            department: ((_a = employee === null || employee === void 0 ? void 0 : employee.department) === null || _a === void 0 ? void 0 : _a.departmentName) || null,
            employmentType: ((_b = employee === null || employee === void 0 ? void 0 : employee.employmentType) === null || _b === void 0 ? void 0 : _b.employmentType) || null,
            dateOfJoining: (employee === null || employee === void 0 ? void 0 : employee.dateOfJoining) || null,
            tenure: formatTenure(employee === null || employee === void 0 ? void 0 : employee.dateOfJoining)
        },
        stats: {
            hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
            hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
            daysLoggedThisMonth: daysLogged.size,
            activeProjects: projects.length,
            tasksAssigned: taskIds.size,
            pendingApprovals: statusCounts.waiting
        },
        statusCounts,
        projects: projects.slice(0, 6),
        recentEntries: recentEntries.slice(0, 6)
    };
};
exports.default = { getEmployeeDashboard };
