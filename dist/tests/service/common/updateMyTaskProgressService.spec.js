"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateMyTaskProgressService_1 = __importDefault(require("../../../services/common/updateMyTaskProgressService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../../model/courseTaskModel"));
const taskProgressModel_1 = __importDefault(require("../../../model/taskProgressModel"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
const manageCourseProgress_1 = __importDefault(require("../../../util/manageCourseProgress"));
const sendCourseCompletionEmail_1 = __importDefault(require("../../../util/sendCourseCompletionEmail"));
const courseAssignmentStatusValues_1 = require("../../../types/courseAssignmentStatusValues");
jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn() }
}));
jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/taskProgressModel', () => ({
    __esModule: true,
    default: { findOneAndUpdate: jest.fn() }
}));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../util/manageCourseProgress', () => ({
    __esModule: true,
    default: {
        getActiveModulesByCourse: jest.fn(),
        getActiveTasksByModule: jest.fn(),
        getCompletedTaskIds: jest.fn(),
        buildCourseModules: jest.fn(),
        summariseProgress: jest.fn(),
        deriveAssignmentStatus: jest.fn(),
        percentOf: jest.fn()
    }
}));
jest.mock('../../../util/sendCourseCompletionEmail', () => ({
    __esModule: true,
    default: { sendCourseCompletionEmail: jest.fn() }
}));
const assignmentFindOneMock = courseAssignmentModel_1.default.findOne;
const assignmentUpdateOneMock = courseAssignmentModel_1.default.updateOne;
const courseModuleFindByIdMock = coursemoduleModel_1.default.findById;
const courseTaskFindByIdMock = courseTaskModel_1.default.findById;
const taskProgressFindOneAndUpdateMock = taskProgressModel_1.default.findOneAndUpdate;
const userFindByIdMock = userModel_1.default.findById;
const courseFindByIdMock = coursesModel_1.default.findById;
const getActiveModulesByCourseMock = manageCourseProgress_1.default.getActiveModulesByCourse;
const getActiveTasksByModuleMock = manageCourseProgress_1.default.getActiveTasksByModule;
const getCompletedTaskIdsMock = manageCourseProgress_1.default.getCompletedTaskIds;
const buildCourseModulesMock = manageCourseProgress_1.default.buildCourseModules;
const summariseProgressMock = manageCourseProgress_1.default.summariseProgress;
const deriveAssignmentStatusMock = manageCourseProgress_1.default.deriveAssignmentStatus;
const sendCourseCompletionEmailMock = sendCourseCompletionEmail_1.default.sendCourseCompletionEmail;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
const completedTaskMap = new Map([['task1', new Date('2026-07-08T10:00:00Z')]]);
describe('updateMyTaskProgressService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        assignmentUpdateOneMock.mockReset();
        courseModuleFindByIdMock.mockReset();
        courseTaskFindByIdMock.mockReset();
        taskProgressFindOneAndUpdateMock.mockReset();
        userFindByIdMock.mockReset();
        courseFindByIdMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        getActiveTasksByModuleMock.mockReset();
        getCompletedTaskIdsMock.mockReset();
        buildCourseModulesMock.mockReset();
        summariseProgressMock.mockReset();
        deriveAssignmentStatusMock.mockReset();
        sendCourseCompletionEmailMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const assignment = {
        _id: 'assign1',
        courseId: 'course1',
        employeeId: 'emp1',
        status: 'Assigned',
        completedAt: new Date('2026-07-08T10:00:00Z'),
        assignedByAdminId: 'admin1'
    };
    const moduleDoc = { _id: 'module1', courseId: 'course1', moduleName: 'Intro' };
    const taskDoc = { _id: 'task1', moduleId: 'module1', taskName: 'Read', status: 'ACTIVE' };
    const mockProgressChain = () => {
        getActiveModulesByCourseMock.mockResolvedValue(new Map([['course1', [moduleDoc]]]));
        getCompletedTaskIdsMock.mockResolvedValue(new Map([['assign1', completedTaskMap]]));
        getActiveTasksByModuleMock.mockResolvedValue(new Map([['module1', [taskDoc]]]));
        buildCourseModulesMock.mockReturnValue([
            { _id: 'module1', moduleName: 'Intro', tasks: [], totalTasks: 1, completedTasks: 1 }
        ]);
        summariseProgressMock.mockReturnValue({ totalTasks: 1, completedTasks: 1, percentComplete: 100 });
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS);
    };
    it('returns notFound when the assignment does not exist for the employee', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        expect(assignmentFindOneMock).toHaveBeenCalledWith({ _id: 'assign1', employeeId: 'emp1' });
        expect(courseTaskFindByIdMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, notFound: true });
    });
    it('returns invalidTask when the task does not exist', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        expect(courseTaskFindByIdMock).toHaveBeenCalledWith('task1');
        expect(courseModuleFindByIdMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, invalidTask: true });
    });
    it('returns invalidTask when the task module does not belong to the assigned course', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ _id: 'module9', courseId: 'course9' })
        });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        expect(result).toEqual({ success: false, invalidTask: true });
    });
    it('returns invalidTask when the task module is missing', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        expect(result).toEqual({ success: false, invalidTask: true });
    });
    it('updates progress and the assignment status on a successful update', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', false, 'emp1');
        expect(taskProgressFindOneAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(taskProgressFindOneAndUpdateMock).toHaveBeenCalledWith({ courseAssignmentId: 'assign1', moduleId: 'module1', taskId: 'task1' }, { $set: { isCompleted: false, completedAt: null } }, { upsert: true, new: true, setDefaultsOnInsert: true });
        expect(assignmentUpdateOneMock).toHaveBeenCalledTimes(1);
        expect(assignmentUpdateOneMock).toHaveBeenCalledWith({ _id: 'assign1' }, {
            $set: {
                status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS,
                completedAt: null
            }
        });
        expect(sendCourseCompletionEmailMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            courseStatus: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS,
            progress: { totalTasks: 1, completedTasks: 1, percentComplete: 100 },
            task: { taskId: 'task1', isCompleted: false, completedAt: null }
        });
    });
    it('notifies the assigning admin when the course transitions to Completed', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(id === 'emp1'
                ? { firstName: 'John', lastName: 'Doe' }
                : { firstName: 'Admin', lastName: 'User', email: 'admin@x.com' })
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockResolvedValue(undefined);
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(assignmentUpdateOneMock).toHaveBeenCalledWith({ _id: 'assign1' }, {
            $set: {
                status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED,
                completedAt: assignment.completedAt
            }
        });
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledWith({
            adminEmail: 'admin@x.com',
            adminName: 'Admin User',
            employeeName: 'John Doe',
            courseName: 'React',
            completedAt: expect.any(Date)
        });
        expect(result.courseStatus).toBe(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
    });
    it('skips the notification when no admin email is resolvable', async () => {
        const assignmentWithoutAdmin = Object.assign(Object.assign({}, assignment), { assignedByAdminId: 'admin1' });
        const originalAdminEmail = process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        delete process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignmentWithoutAdmin) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(null) }));
        courseFindByIdMock.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(null) }));
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(sendCourseCompletionEmailMock).not.toHaveBeenCalled();
        if (originalAdminEmail === undefined) {
            delete process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        }
        else {
            process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = originalAdminEmail;
        }
    });
    it('handles a completion transition without a stored completion date and a failed admin notification', async () => {
        const assignmentNoCompletedAt = {
            _id: 'assign1',
            courseId: 'course1',
            employeeId: 'emp1',
            status: 'Assigned',
            completedAt: undefined,
            assignedByAdminId: 'admin1'
        };
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignmentNoCompletedAt) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(id === 'emp1'
                ? { firstName: 'John', lastName: 'Doe' }
                : { firstName: 'Admin', lastName: 'User', email: 'admin@x.com' })
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockRejectedValue(new Error('email down'));
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(assignmentUpdateOneMock).toHaveBeenCalledWith({ _id: 'assign1' }, { $set: { status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED, completedAt: expect.any(Date) } });
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[CourseCompletion] Failed to notify admin:'), 'email down');
        expect(result.courseStatus).toBe(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
    });
    it('does not notify when the course was already completed', async () => {
        const alreadyCompleted = Object.assign(Object.assign({}, assignment), { status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED, completedAt: undefined });
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(alreadyCompleted) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(sendCourseCompletionEmailMock).not.toHaveBeenCalled();
        expect(assignmentUpdateOneMock).toHaveBeenCalledWith({ _id: 'assign1' }, { $set: { status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED, completedAt: expect.any(Date) } });
        expect(result.task).toEqual({ taskId: 'task1', isCompleted: true, completedAt: expect.any(Date) });
    });
    it('uses empty module and completion maps safely', async () => {
        const assignmentNoData = {
            _id: 'assign1',
            courseId: 'course1',
            employeeId: 'emp1',
            status: 'Assigned',
            assignedByAdminId: undefined
        };
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignmentNoData) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        getActiveModulesByCourseMock.mockResolvedValue(new Map());
        getCompletedTaskIdsMock.mockResolvedValue(new Map());
        getActiveTasksByModuleMock.mockResolvedValue(new Map());
        buildCourseModulesMock.mockReturnValue([]);
        summariseProgressMock.mockReturnValue({ totalTasks: 0, completedTasks: 0, percentComplete: 0 });
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        const result = await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(getActiveTasksByModuleMock).toHaveBeenCalledWith([]);
        expect(sendCourseCompletionEmailMock).not.toHaveBeenCalled();
        expect(result).toEqual({
            success: true,
            courseStatus: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED,
            progress: { totalTasks: 0, completedTasks: 0, percentComplete: 0 },
            task: { taskId: 'task1', isCompleted: true, completedAt: expect.any(Date) }
        });
    });
    it('uses placeholder names when the employee and admin documents have no names', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ email: 'admin@x.com' })
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockResolvedValue(undefined);
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledWith(expect.objectContaining({ adminName: '', employeeName: '' }));
    });
    it('logs the raw error when the notification failure has no message', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(id === 'emp1' ? { firstName: 'J' } : { email: 'admin@x.com' })
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockRejectedValue('plain message string');
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[CourseCompletion] Failed to notify admin:'), 'plain message string');
    });
    it('logs a fallback when the notification failure reason is undefined', async () => {
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(id === 'emp1' ? { firstName: 'J' } : { email: 'admin@x.com' })
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockRejectedValue(undefined);
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[CourseCompletion] Failed to notify admin:'), undefined);
    });
    it('notifies using the env admin email when there is no assigning admin', async () => {
        const assignmentWithoutAdmin = Object.assign(Object.assign({}, assignment), { assignedByAdminId: undefined });
        const originalAdminEmail = process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = 'fallback-admin@x.com';
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignmentWithoutAdmin) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(id === 'emp1' ? { firstName: 'John', lastName: 'Doe' } : null)
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockResolvedValue(undefined);
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledWith({
            adminEmail: 'fallback-admin@x.com',
            adminName: undefined,
            employeeName: 'John Doe',
            courseName: 'React',
            completedAt: expect.any(Date)
        });
        if (originalAdminEmail === undefined) {
            delete process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        }
        else {
            process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = originalAdminEmail;
        }
    });
    it('falls back to the env admin email when the assigned admin has no email', async () => {
        const originalAdminEmail = process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = 'env-admin@x.com';
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(id === 'emp1' ? { firstName: 'J', lastName: 'D' } : { email: undefined })
        }));
        courseFindByIdMock.mockImplementation(() => ({
            lean: jest.fn().mockResolvedValue({ courseName: 'React' })
        }));
        sendCourseCompletionEmailMock.mockResolvedValue(undefined);
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledWith(expect.objectContaining({ adminEmail: 'env-admin@x.com' }));
        if (originalAdminEmail === undefined) {
            delete process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        }
        else {
            process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = originalAdminEmail;
        }
    });
    it('falls back to the default admin email and placeholder names', async () => {
        const originalAdminEmail = process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = 'fallback-admin@x.com';
        assignmentFindOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(assignment) });
        courseTaskFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(taskDoc) });
        courseModuleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(moduleDoc) });
        mockProgressChain();
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
        taskProgressFindOneAndUpdateMock.mockResolvedValue({ _id: 'p1' });
        assignmentUpdateOneMock.mockResolvedValue({ nModified: 1 });
        userFindByIdMock.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(null) }));
        courseFindByIdMock.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(null) }));
        sendCourseCompletionEmailMock.mockResolvedValue(undefined);
        await updateMyTaskProgressService_1.default.updateMyTaskProgress('assign1', 'task1', true, 'emp1');
        await flushMicrotasks();
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseCompletionEmailMock).toHaveBeenCalledWith({
            adminEmail: 'fallback-admin@x.com',
            adminName: undefined,
            employeeName: 'Employee',
            courseName: 'Course',
            completedAt: expect.any(Date)
        });
        if (originalAdminEmail === undefined) {
            delete process.env.ADMIN_EMAIL_ABOUT_CUSTOMER;
        }
        else {
            process.env.ADMIN_EMAIL_ABOUT_CUSTOMER = originalAdminEmail;
        }
    });
});
