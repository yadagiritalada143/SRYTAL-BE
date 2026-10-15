import cron from 'node-cron';
import CourseAssignment from '../model/courseAssignmentModel';
import CourseModel from '../model/coursesModel';
import UserModel from '../model/userModel';
import sendCourseReminderEmail from '../util/sendCourseReminderEmail';

const REMINDER_INTERVAL_DAYS = 3;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfISTDay = (date: Date): Date => {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
};

const daysBetweenISTDays = (from: Date, to: Date): number => {
  return Math.round((startOfISTDay(to).getTime() - startOfISTDay(from).getTime()) / DAY_MS);
};

const isReminderDue = (assignment: any): boolean => {
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

    const incompleteAssignments = await CourseAssignment.find({
      status: { $ne: 'Completed' },
      dueDate: { $exists: true, $ne: null, $gte: now },
    })
      .populate({ path: 'courseId', model: CourseModel })
      .sort({ dueDate: 1 })
      .lean()
      .exec();

    const assignmentsDueForReminder = incompleteAssignments.filter(isReminderDue);

    if (!assignmentsDueForReminder || assignmentsDueForReminder.length === 0) {
      console.log('Course Reminder Cron: No incomplete assignments are due for a reminder.');
      return;
    };

    const employeeIds = assignmentsDueForReminder.map((assignment: any) => assignment.employeeId);
    const employees = await UserModel.find({ _id: { $in: employeeIds } })
      .select('firstName lastName email')
      .lean();

    const employeeById = new Map<string, any>((
      employees as any[]).map((
        employee: any) => 
        [String(employee._id), employee])
    );

    for (const assignment of assignmentsDueForReminder) {
      try {
        const employee = employeeById.get(String((assignment as any).employeeId));
        const course = (assignment as any).courseId;

        if (!employee || !employee.email || !course || !course.courseName) {
          continue;
        }

        const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email;

        await sendCourseReminderEmail.sendCourseReminderEmail({
          employeeName,
          employeeEmail: employee.email,
          courseName: course.courseName,
          dueDate: (assignment as any).dueDate,
        });

        await CourseAssignment.findByIdAndUpdate(
          assignment._id,
          {
            lastReminderSentAt: new Date(),
          }
        );
      } catch (emailError: any) {
        console.error(`Course Reminder Cron: Failed to send reminder for assignment ${(assignment as any)._id} — ${emailError.message}`);
      }
    }

  } catch (error: any) {
    console.error(`Course Reminder Cron: Error running reminder job — ${error.message}`);
  }
};

cron.schedule('30 11 * * *', () => {
  console.warn('Course Reminder Cron: Triggered at 11:30 AM IST...');
  sendCourseReminders();
}, {
  timezone: 'Asia/Kolkata',
});

export default { sendCourseReminders };
