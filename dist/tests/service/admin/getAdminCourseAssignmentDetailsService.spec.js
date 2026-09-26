"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAdminCourseAssignmentDetailsService_1 = __importDefault(require("../../../services/admin/getAdminCourseAssignmentDetailsService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
const userModel_1 = __importDefault(require("../../../model/userModel"));
const manageCourseProgress_1 = __importDefault(require("../../../util/manageCourseProgress"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const courseAssignmentStatusValues_1 = require("../../../types/courseAssignmentStatusValues");
jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
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
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
}));
const findOneMock = courseAssignmentModel_1.default.findOne;
const userFindByIdMock = userModel_1.default.findById;
const getActiveModulesByCourseMock = manageCourseProgress_1.default.getActiveModulesByCourse;
const getCompletedTaskIdsMock = manageCourseProgress_1.default.getCompletedTaskIds;
const getActiveTasksByModuleMock = manageCourseProgress_1.default.getActiveTasksByModule;
const buildCourseModulesMock = manageCourseProgress_1.default.buildCourseModules;
const summariseProgressMock = manageCourseProgress_1.default.summariseProgress;
const deriveAssignmentStatusMock = manageCourseProgress_1.default.deriveAssignmentStatus;
const getCourseMediaSignedUrlMock = manageCourseMedia_1.default.getCourseMediaSignedUrl;
const buildFindOneChain = (assignment) => {
    findOneMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(assignment)
        })
    });
};
const setupProgress = () => {
    getActiveModulesByCourseMock.mockResolvedValue(new Map([['c1', [{ _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1' }]]]));
    getCompletedTaskIdsMock.mockResolvedValue(new Map());
    getActiveTasksByModuleMock.mockResolvedValue(new Map([['m1', [{ _id: 't1', title: 'Task 1' }]]]));
    buildCourseModulesMock.mockReturnValue([
        { _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1', tasks: [{ _id: 't1' }] }
    ]);
    summariseProgressMock.mockReturnValue({ completedTasks: 1, totalTasks: 2 });
    deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED);
};
describe('getAdminCourseAssignmentDetailsService', () => {
    beforeEach(() => {
        findOneMock.mockReset();
        userFindByIdMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        getCompletedTaskIdsMock.mockReset();
        getActiveTasksByModuleMock.mockReset();
        buildCourseModulesMock.mockReset();
        summariseProgressMock.mockReset();
        deriveAssignmentStatusMock.mockReset();
        getCourseMediaSignedUrlMock.mockReset();
    });
    const buildAssignment = () => ({
        _id: 'a1',
        courseId: { _id: 'c1', courseName: 'Intro', courseDescription: 'desc', thumbnail: 'thumb.png' },
        employeeId: 'e1',
        assignedAt: new Date('2026-01-01'),
        dueDate: new Date('2026-12-01'),
        completedAt: null
    });
    const setupUser = (employee) => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(employee) })
        });
    };
    it('returns the full course assignment detail with a signed thumbnail', async () => {
        buildFindOneChain(buildAssignment());
        setupUser({ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeId: 'EMP01' });
        setupProgress();
        getCourseMediaSignedUrlMock.mockResolvedValue('signed-url');
        const result = await getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails('a1');
        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'a1' });
        expect(findOneMock.mock.results[0].value.populate).toHaveBeenCalledWith({
            path: 'courseId',
            model: coursesModel_1.default
        });
        expect(userFindByIdMock).toHaveBeenCalledWith('e1');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('thumb.png');
        expect(result).toMatchObject({
            success: true,
            employee: { employeeId: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeCode: 'EMP01' },
            course: {
                courseAssignmentId: 'a1',
                courseId: 'c1',
                courseName: 'Intro',
                thumbnailUrl: 'signed-url',
                status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.COMPLETED,
                isOverdue: false,
                totalModules: 1
            }
        });
    });
    it('returns success false when the assignment is not found', async () => {
        buildFindOneChain(null);
        const result = await getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails('a9');
        expect(result).toEqual({ success: false });
        expect(userFindByIdMock).not.toHaveBeenCalled();
    });
    it('returns success false when the assignment has no course', async () => {
        buildFindOneChain({ _id: 'a1', courseId: null });
        const result = await getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails('a1');
        expect(result).toEqual({ success: false });
    });
    it('returns an empty thumbnail url and null employee when they are missing', async () => {
        const assignment = buildAssignment();
        assignment.courseId.thumbnail = undefined;
        buildFindOneChain(assignment);
        setupUser(null);
        setupProgress();
        const result = await getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails('a1');
        const course = result.course;
        expect(getCourseMediaSignedUrlMock).not.toHaveBeenCalled();
        expect(course.thumbnailUrl).toBe('');
        expect(result.employee).toBeNull();
    });
    it('swallows thumbnail signing failures', async () => {
        buildFindOneChain(buildAssignment());
        setupUser(null);
        setupProgress();
        getCourseMediaSignedUrlMock.mockRejectedValue(new Error('S3 failure'));
        const result = await getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails('a1');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledTimes(1);
        expect(result.course.thumbnailUrl).toBe('');
    });
});
