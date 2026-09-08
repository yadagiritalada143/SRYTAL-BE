import cron from 'node-cron';
import CourseAssignment from '../model/courseAssignmentModel';
import CourseModel from '../model/coursesModel';
import UserModel from '../model/userModel';
import sendCourseReminderEmail from '../util/sendCourseReminderEmail';

const sendCourseReminders = async () => {
  try {

    const now = new Date();

    const threeDaysAgo = new Date(
      now.getTime() - 3 * 24 * 60 * 60 * 1000
    );

    const incompleteAssignments = await CourseAssignment.find({
      status: { $ne: 'Completed' },
      dueDate: { $exists: true, $ne: null, $gte: now },
      $or: [
        { lastReminderSentAt: null },
        { lastReminderSentAt: { $lte: threeDaysAgo } },
     ],
    })
      .populate({ path: 'courseId', model: CourseModel })
      .sort({ dueDate: 1 })
      .lean()
      .exec();

    if (!incompleteAssignments || incompleteAssignments.length === 0) {
      console.log('Course Reminder Cron: No incomplete assignments with valid due dates found.');
      return;
    };

    const employeeIds = incompleteAssignments.map((assignment: any) => assignment.employeeId);
    const employees = await UserModel.find({ _id: { $in: employeeIds } })
      .select('firstName lastName email')
      .lean();

    const employeeById = new Map<string, any>((
      employees as any[]).map((
        employee: any) => 
        [String(employee._id), employee])
    );

    for (const assignment of incompleteAssignments) {
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
  console.warn('Course Reminder Cron: Triggered at 11:30 AM...');
  sendCourseReminders();
});

export default { sendCourseReminders };
