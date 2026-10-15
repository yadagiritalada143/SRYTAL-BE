import cron from 'node-cron';
import CourseAssignment from '../../model/courseAssignmentModel';
import UserModel from '../../model/userModel';
import sendCourseReminderEmail from '../../util/sendCourseReminderEmail';

jest.mock('node-cron', () => ({
    __esModule: true,
    default: { schedule: jest.fn() }
}));

jest.mock('../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { find: jest.fn(), findByIdAndUpdate: jest.fn() }
}));

jest.mock('../../model/userModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));

jest.mock('../../util/sendCourseReminderEmail', () => ({
    __esModule: true,
    default: { sendCourseReminderEmail: jest.fn() }
}));

const cronScheduleMock = cron.schedule as unknown as jest.Mock;
const assignmentFindMock = (CourseAssignment as unknown as { find: jest.Mock }).find;
const assignmentUpdateMock = (CourseAssignment as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;
const userFindMock = (UserModel as unknown as { find: jest.Mock }).find;
const sendCourseReminderEmailMock =
    sendCourseReminderEmail.sendCourseReminderEmail as unknown as jest.Mock;

const NOW_IST_1130 = new Date('2026-06-10T06:00:00.000Z');
const BUILD_USER_QUERY = (employees: any[]) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(employees)
});

const buildAssignmentQuery = (result: any[]) => ({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result)
});

const makeAssignment = (overrides: Record<string, any>) => ({
    _id: 'a1',
    employeeId: 'e1',
    courseId: 'c1',
    status: 'Assigned',
    assignedAt: new Date('2026-06-01T05:00:00.000Z'),
    dueDate: new Date('2026-07-01T00:00:00.000Z'),
    reminderScheduleStartDate: new Date('2026-06-01T05:00:00.000Z'),
    lastReminderSentAt: null,
    ...overrides
});

const makeEmployee = () => ({ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'john@x.com' });

const makeCourse = () => ({ _id: 'c1', courseName: 'Intro Course' });

describe('courseReminderCronJob', () => {
    let requireModule: () => any;

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW_IST_1130);
        requireModule = () => require('../../jobs/courseReminderCronJob').default;
        requireModule();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        assignmentFindMock.mockReset();
        assignmentUpdateMock.mockReset();
        userFindMock.mockReset();
        sendCourseReminderEmailMock.mockReset();
        assignmentUpdateMock.mockResolvedValue({ _id: 'a1' });
        sendCourseReminderEmailMock.mockResolvedValue(undefined);
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('is scheduled to run at 11:30 AM Indian Standard Time', () => {
        expect(cronScheduleMock).toHaveBeenCalledWith(
            '30 11 * * *',
            expect.any(Function),
            { timezone: 'Asia/Kolkata' }
        );
    });

    it('queries only incomplete assignments with a valid, not-yet-passed due date', async () => {
        assignmentFindMock.mockReturnValue(buildAssignmentQuery([]));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([]));

        await requireModule().sendCourseReminders();

        expect(assignmentFindMock).toHaveBeenCalledWith({
            status: { $ne: 'Completed' },
            dueDate: { $exists: true, $ne: null, $gte: NOW_IST_1130 }
        });
        expect(sendCourseReminderEmailMock).not.toHaveBeenCalled();
    });

    it('does not send a reminder to a course assigned within the last 3 days', async () => {
        const assignments = [makeAssignment({
            _id: 'a1',
            reminderScheduleStartDate: new Date('2026-06-08T05:00:00.000Z')
        })];
        assignmentFindMock.mockReturnValue(buildAssignmentQuery(assignments));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([makeEmployee()]));

        await requireModule().sendCourseReminders();

        expect(sendCourseReminderEmailMock).not.toHaveBeenCalled();
        expect(assignmentUpdateMock).not.toHaveBeenCalled();
    });

    it('sends the first reminder 3 days after the course assignment date', async () => {
        const assignments = [makeAssignment({
            _id: 'a1',
            reminderScheduleStartDate: new Date('2026-06-07T05:00:00.000Z')
        })];
        assignmentFindMock.mockReturnValue(buildAssignmentQuery(assignments));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([makeEmployee()]));
        (assignments[0] as any).courseId = makeCourse();

        await requireModule().sendCourseReminders();

        expect(sendCourseReminderEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseReminderEmailMock).toHaveBeenCalledWith({
            employeeName: 'John Doe',
            employeeEmail: 'john@x.com',
            courseName: 'Intro Course',
            dueDate: assignments[0].dueDate
        });
        expect(assignmentUpdateMock).toHaveBeenCalledWith(
            'a1',
            { lastReminderSentAt: expect.any(Date) }
        );
    });

    it('sends a follow-up reminder every 3 days after the previous one', async () => {
        const assignments = [makeAssignment({
            _id: 'a1',
            reminderScheduleStartDate: new Date('2026-06-01T05:00:00.000Z'),
            lastReminderSentAt: new Date('2026-06-07T06:00:00.000Z')
        })];
        assignmentFindMock.mockReturnValue(buildAssignmentQuery(assignments));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([makeEmployee()]));
        (assignments[0] as any).courseId = makeCourse();

        await requireModule().sendCourseReminders();

        expect(sendCourseReminderEmailMock).toHaveBeenCalledTimes(1);
    });

    it('does not send a reminder before 3 days have passed since the previous one', async () => {
        const assignments = [makeAssignment({
            _id: 'a1',
            reminderScheduleStartDate: new Date('2026-06-01T05:00:00.000Z'),
            lastReminderSentAt: new Date('2026-06-09T06:00:00.000Z')
        })];
        assignmentFindMock.mockReturnValue(buildAssignmentQuery(assignments));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([makeEmployee()]));

        await requireModule().sendCourseReminders();

        expect(sendCourseReminderEmailMock).not.toHaveBeenCalled();
    });

    it('restarts the reminder cycle from the due date update, not the assignment date', async () => {
        const assignments = [makeAssignment({
            _id: 'a1',
            assignedAt: new Date('2026-05-01T05:00:00.000Z'),
            reminderScheduleStartDate: new Date('2026-06-09T04:00:00.000Z'),
            lastReminderSentAt: null
        })];
        assignmentFindMock.mockReturnValue(buildAssignmentQuery(assignments));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([makeEmployee()]));

        await requireModule().sendCourseReminders();

        expect(sendCourseReminderEmailMock).not.toHaveBeenCalled();
    });

    it('skips assignments that have no valid course or employee', async () => {
        const assignments = [
            makeAssignment({ _id: 'a1', reminderScheduleStartDate: new Date('2026-06-01T05:00:00.000Z') })
        ];
        assignmentFindMock.mockReturnValue(buildAssignmentQuery(assignments));
        userFindMock.mockReturnValue(BUILD_USER_QUERY([]));

        await requireModule().sendCourseReminders();

        expect(sendCourseReminderEmailMock).not.toHaveBeenCalled();
    });
});