"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyAssignedCourseByIdService_1 = __importDefault(require("../../../services/common/getMyAssignedCourseByIdService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const manageCourseProgress_1 = __importDefault(require("../../../util/manageCourseProgress"));
const courseAssignmentStatusValues_1 = require("../../../types/courseAssignmentStatusValues");
jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: {}
}));
jest.mock('../../../util/manageCourseMedia', () => ({
    __esModule: true,
    default: { getCourseMediaSignedUrl: jest.fn() }
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
const assignmentFindOneMock = courseAssignmentModel_1.default.findOne;
const getCourseMediaSignedUrlMock = manageCourseMedia_1.default.getCourseMediaSignedUrl;
const getActiveModulesByCourseMock = manageCourseProgress_1.default.getActiveModulesByCourse;
const getActiveTasksByModuleMock = manageCourseProgress_1.default.getActiveTasksByModule;
const getCompletedTaskIdsMock = manageCourseProgress_1.default.getCompletedTaskIds;
const buildCourseModulesMock = manageCourseProgress_1.default.buildCourseModules;
const summariseProgressMock = manageCourseProgress_1.default.summariseProgress;
const deriveAssignmentStatusMock = manageCourseProgress_1.default.deriveAssignmentStatus;
describe('getMyAssignedCourseByIdService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        getCourseMediaSignedUrlMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        getActiveTasksByModuleMock.mockReset();
        getCompletedTaskIdsMock.mockReset();
        buildCourseModulesMock.mockReset();
        summariseProgressMock.mockReset();
        deriveAssignmentStatusMock.mockReset();
    });
    const mockFindOneChain = (assignment) => {
        assignmentFindOneMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(assignment)
            })
        });
    };
    const mockProgress = () => {
        getActiveModulesByCourseMock.mockResolvedValue(new Map([['course1', [{ _id: 'module1', moduleName: 'Intro' }]]]));
        getCompletedTaskIdsMock.mockResolvedValue(new Map([['assign1', new Map()]]));
        getActiveTasksByModuleMock.mockResolvedValue(new Map());
        buildCourseModulesMock.mockReturnValue([
            { _id: 'module1', moduleName: 'Intro', tasks: [], totalTasks: 0, completedTasks: 0 }
        ]);
        summariseProgressMock.mockReturnValue({ totalTasks: 0, completedTasks: 0, percentComplete: 0 });
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED);
    };
    it('returns success false when the assignment does not exist for the employee', async () => {
        mockFindOneChain(null);
        const result = await getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById('assign1', 'emp1');
        expect(assignmentFindOneMock).toHaveBeenCalledWith({ _id: 'assign1', employeeId: 'emp1' });
        expect(result).toEqual({ success: false });
    });
    it('returns success false when the assigned course has been deleted', async () => {
        mockFindOneChain({ _id: 'assign1', courseId: null });
        const result = await getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById('assign1', 'emp1');
        expect(result).toEqual({ success: false });
    });
    it('returns the full course detail with modules when the assignment is found', async () => {
        mockFindOneChain({
            _id: 'assign1',
            courseId: {
                _id: 'course1',
                courseName: 'React',
                courseDescription: 'Frontend',
                thumbnail: 'thumb1.png'
            },
            assignedAt: new Date('2026-07-01T00:00:00Z'),
            dueDate: new Date('2099-01-01T00:00:00Z'),
            completedAt: null
        });
        mockProgress();
        getCourseMediaSignedUrlMock.mockResolvedValue('https://signed/url');
        const result = await getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById('assign1', 'emp1');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('thumb1.png');
        expect(result).toEqual({
            success: true,
            course: {
                courseAssignmentId: 'assign1',
                courseId: 'course1',
                courseName: 'React',
                courseDescription: 'Frontend',
                thumbnailUrl: 'https://signed/url',
                status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED,
                assignedAt: new Date('2026-07-01T00:00:00Z'),
                dueDate: new Date('2099-01-01T00:00:00Z'),
                completedAt: null,
                isOverdue: false,
                totalModules: 1,
                progress: { totalTasks: 0, completedTasks: 0, percentComplete: 0 },
                modules: [
                    { _id: 'module1', moduleName: 'Intro', tasks: [], totalTasks: 0, completedTasks: 0 }
                ]
            }
        });
    });
    it('returns an empty thumbnail url when signing the thumbnail fails', async () => {
        var _a, _b, _c;
        mockFindOneChain({
            _id: 'assign1',
            courseId: { _id: 'course1', courseName: 'React', courseDescription: 'Frontend', thumbnail: 't.png' },
            assignedAt: new Date('2026-07-01T00:00:00Z'),
            dueDate: null,
            completedAt: new Date('2026-07-08T00:00:00Z')
        });
        mockProgress();
        getCourseMediaSignedUrlMock.mockRejectedValue(new Error('s3 down'));
        const result = await getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById('assign1', 'emp1');
        expect((_a = result.course) === null || _a === void 0 ? void 0 : _a.thumbnailUrl).toBe('');
        expect((_b = result.course) === null || _b === void 0 ? void 0 : _b.isOverdue).toBe(false);
        expect((_c = result.course) === null || _c === void 0 ? void 0 : _c.completedAt).toEqual(new Date('2026-07-08T00:00:00Z'));
    });
    it('handles assignments whose progress maps are empty', async () => {
        var _a, _b, _c;
        mockFindOneChain({
            _id: 'assign1',
            courseId: { _id: 'course1', courseName: 'React', courseDescription: 'Frontend' },
            assignedAt: null,
            dueDate: null,
            completedAt: null
        });
        getActiveModulesByCourseMock.mockResolvedValue(new Map());
        getCompletedTaskIdsMock.mockResolvedValue(new Map());
        getActiveTasksByModuleMock.mockResolvedValue(new Map());
        buildCourseModulesMock.mockReturnValue([]);
        summariseProgressMock.mockReturnValue({ totalTasks: 0, completedTasks: 0, percentComplete: 0 });
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED);
        const result = await getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById('assign1', 'emp1');
        expect(getActiveTasksByModuleMock).toHaveBeenCalledWith([]);
        expect((_a = result.course) === null || _a === void 0 ? void 0 : _a.totalModules).toBe(0);
        expect((_b = result.course) === null || _b === void 0 ? void 0 : _b.modules).toEqual([]);
        expect((_c = result.course) === null || _c === void 0 ? void 0 : _c.isOverdue).toBe(false);
    });
});
