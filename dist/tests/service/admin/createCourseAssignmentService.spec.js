"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createCourseAssignmentService_1 = __importDefault(require("../../../services/admin/createCourseAssignmentService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
const manageCourseProgress_1 = __importDefault(require("../../../util/manageCourseProgress"));
const sendCourseAssignmentEmail_1 = __importDefault(require("../../../util/sendCourseAssignmentEmail"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
jest.mock('../../../model/courseAssignmentModel', () => {
    const CourseAssignment = jest.fn();
    CourseAssignment.findOne = jest.fn();
    return { __esModule: true, default: CourseAssignment };
});
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
    default: { getActiveModulesByCourse: jest.fn() }
}));
jest.mock('../../../util/sendCourseAssignmentEmail', () => ({
    __esModule: true,
    default: { sendCourseAssignmentEmail: jest.fn() }
}));
const CourseAssignmentMock = courseAssignmentModel_1.default;
const userFindByIdMock = userModel_1.default.findById;
const courseFindByIdMock = coursesModel_1.default.findById;
const getActiveModulesByCourseMock = manageCourseProgress_1.default.getActiveModulesByCourse;
const sendCourseAssignmentEmailMock = sendCourseAssignmentEmail_1.default.sendCourseAssignmentEmail;
const buildSelectLeanQuery = (value) => ({
    select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) })
});
describe('createCourseAssignmentService', () => {
    let saveSpy;
    beforeEach(() => {
        CourseAssignmentMock.mockReset();
        CourseAssignmentMock.findOne = jest.fn();
        saveSpy = jest.fn();
        CourseAssignmentMock.mockReturnValue({ save: saveSpy });
        userFindByIdMock.mockReset();
        courseFindByIdMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        sendCourseAssignmentEmailMock.mockReset();
        sendCourseAssignmentEmailMock.mockResolvedValue(undefined);
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const setupData = () => {
        const employee = { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'john@x.com' };
        const admin = { _id: 'u-admin', firstName: 'Admin', lastName: 'One' };
        userFindByIdMock.mockImplementation((id) => buildSelectLeanQuery(id === 'u-admin' ? admin : employee));
        courseFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro', courseDescription: 'desc' }));
        getActiveModulesByCourseMock.mockResolvedValue(new Map([['c1', [{ _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1' }]]]));
        return { employee, admin };
    };
    it('creates an assignment and dispatches the assignment email', async () => {
        const { admin } = setupData();
        const dueDate = new Date('2026-12-01');
        CourseAssignmentMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'a1', courseId: 'c1', employeeId: 'e1' };
        saveSpy.mockResolvedValue(saved);
        const result = await createCourseAssignmentService_1.default.createCourseAssignment('c1', 'e1', 'u-admin', dueDate);
        expect(CourseAssignmentMock.findOne).toHaveBeenCalledTimes(1);
        expect(CourseAssignmentMock.findOne).toHaveBeenCalledWith({ courseId: 'c1', employeeId: 'e1' });
        expect(CourseAssignmentMock).toHaveBeenCalledWith(expect.objectContaining({
            courseId: 'c1',
            employeeId: 'e1',
            assignedByAdminId: 'u-admin',
            status: 'Assigned',
            assignedAt: expect.any(Date),
            dueDate,
            completedAt: null,
            reminderScheduleStartDate: expect.any(Date)
        }));
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(userFindByIdMock).toHaveBeenCalledWith('e1');
        expect(userFindByIdMock).toHaveBeenCalledWith('u-admin');
        expect(courseFindByIdMock).toHaveBeenCalledWith('c1');
        expect(getActiveModulesByCourseMock).toHaveBeenCalledWith(['c1']);
        expect(sendCourseAssignmentEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseAssignmentEmailMock).toHaveBeenCalledWith({
            employeeName: 'John Doe',
            employeeEmail: 'john@x.com',
            courseName: 'Intro',
            courseDescription: 'desc',
            modules: [{ moduleName: 'Module 1', moduleDescription: 'Desc 1' }],
            dueDate,
            assignedByAdminName: `${admin.firstName} ${admin.lastName}`
        });
        expect(result).toEqual(saved);
    });
    it('rejects when the course is already assigned to the employee', async () => {
        CourseAssignmentMock.findOne.mockResolvedValue({ _id: 'a1' });
        await expect(createCourseAssignmentService_1.default.createCourseAssignment('c1', 'e1', 'u-admin', new Date('2026-12-01'))).rejects.toThrow(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE);
        expect(CourseAssignmentMock.findOne).toHaveBeenCalledTimes(1);
        expect(saveSpy).not.toHaveBeenCalled();
    });
    it('rejects when the course id is missing', async () => {
        await expect(createCourseAssignmentService_1.default.createCourseAssignment('', 'e1', 'u-admin', new Date('2026-12-01'))).rejects.toThrow('Invalid course ID');
    });
    it('rejects when the employee id is missing', async () => {
        await expect(createCourseAssignmentService_1.default.createCourseAssignment('c1', '', 'u-admin', new Date('2026-12-01'))).rejects.toThrow('Invalid employee ID');
    });
    it('returns the saved assignment when the email dispatch fails', async () => {
        setupData();
        const dueDate = new Date('2026-12-01');
        CourseAssignmentMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'a1' };
        saveSpy.mockResolvedValue(saved);
        sendCourseAssignmentEmailMock.mockRejectedValue(new Error('Email failed'));
        const result = await createCourseAssignmentService_1.default.createCourseAssignment('c1', 'e1', 'u-admin', dueDate);
        expect(result).toEqual(saved);
        expect(sendCourseAssignmentEmailMock).toHaveBeenCalledTimes(1);
    });
    it('does not dispatch the email when the employee has no email address', async () => {
        const employee = { _id: 'e1', firstName: 'John', lastName: 'Doe', email: undefined };
        userFindByIdMock.mockReturnValue(buildSelectLeanQuery(employee));
        const dueDate = new Date('2026-12-01');
        CourseAssignmentMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'a1' };
        saveSpy.mockResolvedValue(saved);
        courseFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro' }));
        const result = await createCourseAssignmentService_1.default.createCourseAssignment('c1', 'e1', undefined, dueDate);
        expect(result).toEqual(saved);
        expect(sendCourseAssignmentEmailMock).not.toHaveBeenCalled();
    });
    it('propagates errors thrown by the assignment lookup', async () => {
        const modelError = new Error('Lookup failed');
        CourseAssignmentMock.findOne.mockRejectedValue(modelError);
        await expect(createCourseAssignmentService_1.default.createCourseAssignment('c1', 'e1', 'u-admin', new Date('2026-12-01'))).rejects.toThrow(modelError);
    });
});
