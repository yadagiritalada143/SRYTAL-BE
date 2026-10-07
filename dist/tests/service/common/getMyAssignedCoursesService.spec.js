"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyAssignedCoursesService_1 = __importDefault(require("../../../services/common/getMyAssignedCoursesService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const manageCourseMedia_1 = __importDefault(require("../../../util/manageCourseMedia"));
const manageCourseProgress_1 = __importDefault(require("../../../util/manageCourseProgress"));
const courseAssignmentStatusValues_1 = require("../../../types/courseAssignmentStatusValues");
jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { find: jest.fn() }
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
const assignmentFindMock = courseAssignmentModel_1.default.find;
const getCourseMediaSignedUrlMock = manageCourseMedia_1.default.getCourseMediaSignedUrl;
const getActiveModulesByCourseMock = manageCourseProgress_1.default.getActiveModulesByCourse;
const getActiveTasksByModuleMock = manageCourseProgress_1.default.getActiveTasksByModule;
const getCompletedTaskIdsMock = manageCourseProgress_1.default.getCompletedTaskIds;
const buildCourseModulesMock = manageCourseProgress_1.default.buildCourseModules;
const summariseProgressMock = manageCourseProgress_1.default.summariseProgress;
const deriveAssignmentStatusMock = manageCourseProgress_1.default.deriveAssignmentStatus;
describe('getMyAssignedCoursesService', () => {
    beforeEach(() => {
        assignmentFindMock.mockReset();
        getCourseMediaSignedUrlMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        getActiveTasksByModuleMock.mockReset();
        getCompletedTaskIdsMock.mockReset();
        buildCourseModulesMock.mockReset();
        summariseProgressMock.mockReset();
        deriveAssignmentStatusMock.mockReset();
    });
    const mockFindChain = (assignments) => {
        assignmentFindMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(assignments)
                })
            })
        });
    };
    const mockProgress = () => {
        const module1 = { _id: 'module1', moduleName: 'Intro' };
        const module2 = { _id: 'module2', moduleName: 'Advanced' };
        getActiveModulesByCourseMock.mockResolvedValue(new Map([['course1', [module1, module2]]]));
        getCompletedTaskIdsMock.mockResolvedValue(new Map([['assign1', new Map([['task1', null]])]]));
        getActiveTasksByModuleMock.mockResolvedValue(new Map([
            ['module1', [{ _id: 'task1', taskName: 'Read' }]],
            ['module2', []]
        ]));
        buildCourseModulesMock.mockReturnValue([
            { _id: 'module1', moduleName: 'Intro', tasks: [], totalTasks: 1, completedTasks: 1 },
            { _id: 'module2', moduleName: 'Advanced', tasks: [], totalTasks: 0, completedTasks: 0 }
        ]);
        summariseProgressMock.mockReturnValue({ totalTasks: 1, completedTasks: 1, percentComplete: 100 });
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS);
    };
    it('returns an empty course list when there are no assignments', async () => {
        mockFindChain([]);
        const result = await getMyAssignedCoursesService_1.default.getMyAssignedCourses('emp1');
        expect(assignmentFindMock).toHaveBeenCalledWith({ employeeId: 'emp1' });
        expect(result).toEqual({ success: true, courses: [] });
    });
    it('filters out assignments whose course has been deleted', async () => {
        mockFindChain([{ _id: 'assign1', courseId: null }]);
        const result = await getMyAssignedCoursesService_1.default.getMyAssignedCourses('emp1');
        expect(result).toEqual({ success: true, courses: [] });
    });
    it('returns the course summaries including progress and signing status', async () => {
        const now = new Date();
        mockFindChain([
            {
                _id: 'assign1',
                courseId: {
                    _id: 'course1',
                    courseName: 'React',
                    courseDescription: 'Frontend',
                    thumbnail: 'thumb1.png'
                },
                assignedAt: new Date('2026-07-01T00:00:00Z'),
                dueDate: new Date(now.getTime() - 1000 * 60 * 60),
                completedAt: null,
                status: 'Assigned'
            }
        ]);
        mockProgress();
        getCourseMediaSignedUrlMock.mockResolvedValue('https://signed/url');
        const result = await getMyAssignedCoursesService_1.default.getMyAssignedCourses('emp1');
        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledWith('thumb1.png');
        expect(result).toEqual({
            success: true,
            courses: [
                {
                    courseAssignmentId: 'assign1',
                    courseId: 'course1',
                    courseName: 'React',
                    courseDescription: 'Frontend',
                    thumbnailUrl: 'https://signed/url',
                    status: courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS,
                    assignedAt: new Date('2026-07-01T00:00:00Z'),
                    dueDate: expect.any(Date),
                    completedAt: null,
                    isOverdue: true,
                    totalModules: 2,
                    progress: { totalTasks: 1, completedTasks: 1, percentComplete: 100 }
                }
            ]
        });
    });
    it('falls back to an empty thumbnail when signing fails and does not flag a future course as overdue', async () => {
        mockFindChain([
            {
                _id: 'assign1',
                courseId: {
                    _id: 'course1',
                    courseName: 'React',
                    courseDescription: 'Frontend',
                    thumbnail: 'thumb1.png'
                },
                assignedAt: new Date('2026-07-01T00:00:00Z'),
                dueDate: new Date('2099-01-01T00:00:00Z'),
                completedAt: new Date('2026-07-08T00:00:00Z'),
                status: 'Assigned'
            },
            {
                _id: 'assign2',
                courseId: { _id: 'course2', courseName: 'Node', courseDescription: 'Backend' },
                assignedAt: new Date('2026-07-01T00:00:00Z'),
                dueDate: null,
                completedAt: null,
                status: 'Assigned'
            }
        ]);
        getActiveModulesByCourseMock.mockResolvedValue(new Map());
        getCompletedTaskIdsMock.mockResolvedValue(new Map());
        getActiveTasksByModuleMock.mockResolvedValue(new Map());
        buildCourseModulesMock.mockReturnValue([]);
        summariseProgressMock.mockReturnValue({ totalTasks: 0, completedTasks: 0, percentComplete: 0 });
        deriveAssignmentStatusMock.mockReturnValue(courseAssignmentStatusValues_1.COURSE_ASSIGNMENT_STATUS.ASSIGNED);
        getCourseMediaSignedUrlMock.mockRejectedValue(new Error('s3 down'));
        const result = await getMyAssignedCoursesService_1.default.getMyAssignedCourses('emp1');
        expect(result.courses[0].thumbnailUrl).toBe('');
        expect(result.courses[0].isOverdue).toBe(false);
        expect(result.courses[0].completedAt).toEqual(new Date('2026-07-08T00:00:00Z'));
        expect(result.courses[1].thumbnailUrl).toBe('');
        expect(result.courses[1].isOverdue).toBe(false);
    });
});
