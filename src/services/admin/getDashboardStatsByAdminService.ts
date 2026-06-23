import UserModel from '../../model/userModel';
import EmployeePackageModel from '../../model/employeePackageModel';

/**
 * Aggregates an organization-scoped admin dashboard:
 *  - headcount + breakdown by role / department / employment type
 *  - hiring (recent joiners) and HR touchpoints (birthdays / work anniversaries
 *    this month)
 *  - action items (pending password resets)
 *  - timesheet oversight across the org's employees (pending approvals, hours
 *    logged this month, active projects)
 *
 * Everything is scoped to `organizationId`; only employees carry an org link, so
 * timesheet/package data is reached transitively through the org's employees.
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

const tenureYears = (doj?: Date) => {
    if (!doj) return 0;
    const d = new Date(doj);
    if (isNaN(d.getTime())) return 0;
    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
        years -= 1;
    }
    return Math.max(0, years);
};

const getDashboardStatsByAdmin = async (organizationId: string, userId: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const employees: any[] = await UserModel.find({
        organization: organizationId,
        isDeleted: { $ne: true }
    })
        .populate('department')
        .populate('employeeRole')
        .populate('employmentType')
        .lean();

    const totalEmployees = employees.length;
    const roleBreakdown: Record<string, number> = {};
    const departmentBreakdown: Record<string, number> = {};
    const employmentTypeBreakdown: Record<string, number> = {};
    let pendingPasswordResets = 0;

    const upcomingBirthdays: Array<{ name: string; date: number; employeeId?: string }> = [];
    const workAnniversaries: Array<{ name: string; date: number; years: number; employeeId?: string }> = [];

    for (const emp of employees) {
        const role = emp.userRole || 'Unknown';
        roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;

        const dept = emp.department?.departmentName || 'Unassigned';
        departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1;

        const empType = emp.employmentType?.employmentType || 'Unspecified';
        employmentTypeBreakdown[empType] = (employmentTypeBreakdown[empType] || 0) + 1;

        if (emp.passwordResetRequired === 'true') pendingPasswordResets += 1;

        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();

        if (emp.dateOfBirth) {
            const dob = new Date(emp.dateOfBirth);
            if (!isNaN(dob.getTime()) && dob.getMonth() === currentMonth) {
                upcomingBirthdays.push({ name, date: dob.getDate(), employeeId: emp.employeeId });
            }
        }
        if (emp.dateOfJoining) {
            const doj = new Date(emp.dateOfJoining);
            if (!isNaN(doj.getTime()) && doj.getMonth() === currentMonth && doj.getFullYear() < now.getFullYear()) {
                workAnniversaries.push({
                    name,
                    date: doj.getDate(),
                    years: tenureYears(doj),
                    employeeId: emp.employeeId
                });
            }
        }
    }

    upcomingBirthdays.sort((a, b) => a.date - b.date);
    workAnniversaries.sort((a, b) => a.date - b.date);

    const recentHires = employees
        .filter(e => e.dateOfJoining && !isNaN(new Date(e.dateOfJoining).getTime()))
        .sort((a, b) => new Date(b.dateOfJoining).getTime() - new Date(a.dateOfJoining).getTime())
        .slice(0, 5)
        .map(e => ({
            name: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
            employeeId: e.employeeId,
            userRole: e.userRole,
            department: e.department?.departmentName || null,
            designation: Array.isArray(e.employeeRole) && e.employeeRole.length
                ? e.employeeRole.map((r: any) => r.designation).filter(Boolean).join(', ')
                : null,
            dateOfJoining: e.dateOfJoining
        }));

    // ── Timesheet / project oversight across the org's employees ──────────────
    const employeeIds = employees.map(e => e._id);
    const employeePackages: any[] = await EmployeePackageModel.find({
        employeeId: { $in: employeeIds }
    })
        .populate('packages.packageId')
        .lean();

    let pendingTimesheetApprovals = 0;
    let hoursLoggedThisMonth = 0;
    const activeProjects = new Set<string>();
    const employeesWithTimesheets = new Set<string>();

    for (const empPkg of employeePackages) {
        for (const pkg of empPkg.packages || []) {
            const project: any = pkg.packageId || {};
            if (project._id) activeProjects.add(String(project._id));

            for (const task of pkg.tasks || []) {
                for (const ts of (task.timesheet || []) as any[]) {
                    if (ts.status === TIMESHEET_STATUS.WAITING) pendingTimesheetApprovals += 1;
                    const tsDate = ts.date ? new Date(ts.date) : null;
                    const hours = Number(ts.hours) || 0;
                    if (tsDate && !isNaN(tsDate.getTime()) && tsDate >= monthStart && tsDate < monthEnd) {
                        hoursLoggedThisMonth += hours;
                        if (hours > 0) employeesWithTimesheets.add(String(empPkg.employeeId));
                    }
                }
            }
        }
    }

    return {
        success: true,
        stats: {
            totalEmployees,
            activeProjects: activeProjects.size,
            pendingTimesheetApprovals,
            pendingPasswordResets,
            hoursLoggedThisMonth: Math.round(hoursLoggedThisMonth * 10) / 10,
            employeesLoggingThisMonth: employeesWithTimesheets.size
        },
        roleBreakdown,
        departmentBreakdown,
        employmentTypeBreakdown,
        recentHires,
        upcomingBirthdays: upcomingBirthdays.slice(0, 6),
        workAnniversaries: workAnniversaries.slice(0, 6)
    };
};

export default { getDashboardStatsByAdmin };
