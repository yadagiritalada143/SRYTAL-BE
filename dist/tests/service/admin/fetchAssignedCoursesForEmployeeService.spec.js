"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetchAssignedCoursesForEmployeeService_1 = __importDefault(require("../../../services/admin/fetchAssignedCoursesForEmployeeService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const manageCourseProgress_1 = __importDefault(require("../../../util/manageCourseProgress"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
const courseAssignmentStatusValues_1 = require("../../../types/courseAssignmentStatusValues");
jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
}));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { modelName: 'Courses' }
}));
jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../util/manageCourseProgress', () => ({
    __esModule: true,
    default: {
        getActiveModulesByCourse: jest.fn(),
        getCompletedTaskIds: jest.fn(),
        getActiveTasksByModule: jest.fn(),
        buildCourseModules: jest.fn(),
        summariseProgress: jest.fn(),
        deriveAssignmentStatus: jest.fn()
    }
}));
const findMock = courseAssignmentModel_1.default.find;
const findByIdMock = userModel_1.default.findById;
const getActiveModulesByCourseMock = manageCourseProgress_1.default.getActiveModulesByCourse;
const getCompletedTaskIdsMock = manageCourseProgress_1.default.getCompletedTaskIds;
const getActiveTasksByModuleMock = manageCourseProgress_1.default.getActiveTasksByModule;
const buildCourseModulesMock = manageCourseProgress_1.default.buildCourseModules;
const summariseProgressMock = manageCourseProgress_1.default.summariseProgress;
const deriveAssignmentStatusMock = manageCourseProgress_1.default.deriveAssignmentStatus;
const buildFindChain = (assignments) => {
    const populateFn = jest.fn();
    const sortFn = jest.fn();
    const leanFn = jest.fn();
    populateFn.mockReturnValue({ sort: sortFn });
    sortFn.mockReturnValue({ lean: leanFn });
    leanFn.mockResolvedValue(assignments);
    findMock.mockReturnValue({ populate: populateFn });
    return { populateFn, sortFn, leanFn };
};
const setupEmployee = (employee) => {
    const selectFn = jest.fn();
    const leanFn = jest.fn();
    selectFn.mockReturnValue({ lean: leanFn });
    leanFn.mockResolvedValue(employee);
    findByIdMock.mockReturnValue({ select: selectFn });
};
const setupProgress = () => {
    getActiveModulesByCourseMock.mockImplementation((courseIds) => Promise.resolve(new Map(courseIds.map((id) => [id, [{ _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1' }]]))));
    getCompletedTaskIdsMock.mockResolvedValue(new Map());
    getActiveTasksByModuleMock.mockResolvedValue(new Map([['m1', [{ _id: 't1', taskName: 'Task 1', taskDescription: 'Task Desc' }]]]));
    buildCourseModulesMock.mockReturnValue([
        {
            _id: 'm1',
            moduleName: 'Module 1',
            moduleDescription: 'Desc 1',
            tasks: [{ _id: 't1', taskName: 'Task 1', isCompleted: false }],
            totalTasks: 1,
            completedTasks: 0
        }
    ]);
    summariseProgressMock.mockReturnValue({ completedTasks: 0, totalTasks: 1, percentComplete: 0 });
    deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED);
};
describe('fetchAssignedCoursesForEmployeeService', () => {
    beforeEach(() => {
        findMock.mockReset();
        findByIdMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        getCompletedTaskIdsMock.mockReset();
        getActiveTasksByModuleMock.mockReset();
        buildCourseModulesMock.mockReset();
        summariseProgressMock.mockReset();
        deriveAssignmentStatusMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const validId = '507f1f77bcf86cd799439011';
    it('returns assigned courses for a valid employee', async () => {
        const employee = { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com' };
        const assignments = [
            {
                _id: 'a1',
                courseId: { _id: 'c1', courseName: 'Node.js', courseDescription: 'Learn Node.js' },
                employeeId: 'e1',
                assignedByAdminId: 'admin1',
                assignedAt: new Date('2026-09-01'),
                dueDate: new Date('2026-09-30'),
                completedAt: null
            }
        ];
        setupEmployee(employee);
        buildFindChain(assignments);
        setupProgress();
        const result = await fetchAssignedCoursesForEmployeeService_1.default.fetchAssignedCoursesForEmployee(validId);
        expect(findByIdMock).toHaveBeenCalledWith(validId);
        expect(findMock).toHaveBeenCalledWith({ employeeId: validId });
        expect(result.success).toBe(true);
        expect(result.message).toBe(courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_FETCH_SUCCESS_MESSAGE);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toEqual({
            courseAssignmentId: 'a1',
            courseId: 'c1',
            courseName: 'Node.js',
            description: 'Learn Node.js',
            status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED,
            assignedDate: new Date('2026-09-01'),
            dueDate: new Date('2026-09-30'),
            assignedBy: 'admin1'
        });
    });
    it('returns empty data when employee has no assigned courses', async () => {
        const employee = { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com' };
        setupEmployee(employee);
        buildFindChain([]);
        const result = await fetchAssignedCoursesForEmployeeService_1.default.fetchAssignedCoursesForEmployee(validId);
        expect(result.success).toBe(true);
        expect(result.message).toBe(courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_NO_COURSES_MESSAGE);
        expect(result.data).toEqual([]);
        expect(getActiveModulesByCourseMock).not.toHaveBeenCalled();
    });
    it('throws when employee is not found', async () => {
        findByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
        });
        await expect(fetchAssignedCoursesForEmployeeService_1.default.fetchAssignedCoursesForEmployee(validId)).rejects.toThrow(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE);
    });
    it('throws with fetch error when database query fails', async () => {
        const employee = { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com' };
        setupEmployee(employee);
        findMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValue(new Error('Database failure'))
                })
            })
        });
        await expect(fetchAssignedCoursesForEmployeeService_1.default.fetchAssignedCoursesForEmployee(validId)).rejects.toThrow();
    });
});
