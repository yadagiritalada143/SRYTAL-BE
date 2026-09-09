import EmployeePackageModel from '../../model/employeePackageModel';
import UserModel from '../../model/userModel';

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

const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

// Monday as the first day of the week.
const startOfWeek = (d: Date) => {
    const x = startOfDay(d);
    const day = x.getDay();
    const diff = day === 0 ? 6 : day - 1;
    x.setDate(x.getDate() - diff);
    return x;
};

const monthsBetween = (from: Date, to: Date) => {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (to.getDate() < from.getDate()) months -= 1;
    return Math.max(0, months);
};

const formatTenure = (doj?: Date): string | null => {
    if (!doj) return null;
    const d = new Date(doj);
    if (isNaN(d.getTime())) return null;
    const months = monthsBetween(d, new Date());
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
    parts.push(`${remMonths} mo${remMonths !== 1 ? 's' : ''}`);
    return parts.join(' ');
};

const getEmployeeDashboard = async (userId: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const weekStart = startOfWeek(now);

    const [employee, employeePackages] = await Promise.all([
        UserModel.findById(userId)
            .populate('employeeRole')
            .populate('employmentType')
            .populate('department')
            .lean(),
        EmployeePackageModel.find({ employeeId: userId })
            .populate('packages.packageId')
            .populate('packages.tasks.taskId')
            .lean()
    ]);

    let hoursThisMonth = 0;
    let hoursThisWeek = 0;
    const daysLogged = new Set<string>();
    const statusCounts = { approved: 0, waiting: 0, rejected: 0, notSubmitted: 0 };

    const projectMap = new Map<string, { title: string; hours: number; endDate?: Date }>();
    const taskIds = new Set<string>();
    const recentEntries: Array<{
        date: Date;
        hours: number;
        status: string;
        taskTitle: string;
        projectTitle: string;
        comments: string;
    }> = [];

    for (const empPkg of employeePackages || []) {
        for (const pkg of empPkg.packages || []) {
            const project: any = pkg.packageId || {};
            const projectId = String(project._id || pkg.packageId || Math.random());
            const projectTitle = project.title || 'Untitled Project';
            if (!projectMap.has(projectId)) {
                projectMap.set(projectId, { title: projectTitle, hours: 0, endDate: project.endDate });
            }

            for (const task of pkg.tasks || []) {
                const taskDoc: any = task.taskId || {};
                if (taskDoc._id) taskIds.add(String(taskDoc._id));
                const taskTitle = taskDoc.title || 'Untitled Task';

                for (const ts of (task.timesheet || []) as any[]) {
                    const tsDate = ts.date ? new Date(ts.date) : null;
                    const hours = Number(ts.hours) || 0;

                    // Status tally (all-time, gives a sense of pending work).
                    switch (ts.status) {
                        case TIMESHEET_STATUS.APPROVED: statusCounts.approved += 1; break;
                        case TIMESHEET_STATUS.WAITING: statusCounts.waiting += 1; break;
                        case TIMESHEET_STATUS.REJECTED: statusCounts.rejected += 1; break;
                        case TIMESHEET_STATUS.NOT_SUBMITTED: statusCounts.notSubmitted += 1; break;
                    }

                    if (tsDate && !isNaN(tsDate.getTime())) {
                        if (tsDate >= monthStart && tsDate < monthEnd) {
                            hoursThisMonth += hours;
                            if (hours > 0) daysLogged.add(startOfDay(tsDate).toISOString());
                            const proj = projectMap.get(projectId);
                            if (proj) proj.hours += hours;
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

    const designation = Array.isArray(employee?.employeeRole) && employee?.employeeRole.length
        ? (employee?.employeeRole as any[]).map(r => r.designation).filter(Boolean).join(', ')
        : null;

    return {
        success: true,
        profile: {
            firstName: employee?.firstName || '',
            lastName: employee?.lastName || '',
            employeeId: employee?.employeeId || null,
            designation,
            department: (employee?.department as any)?.departmentName || null,
            employmentType: (employee?.employmentType as any)?.employmentType || null,
            dateOfJoining: employee?.dateOfJoining || null,
            tenure: formatTenure(employee?.dateOfJoining as Date | undefined)
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

export default { getEmployeeDashboard };
