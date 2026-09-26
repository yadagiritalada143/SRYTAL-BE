import getAdminCourseAssignmentDetailsService from '../../../services/admin/getAdminCourseAssignmentDetailsService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModel from '../../../model/coursesModel';
import UserModel from '../../../model/userModel';
import courseProgress from '../../../util/manageCourseProgress';
import courseMedia from '../../../util/manageCourseMedia';
import { COURSE_ASSIGNMENT_STATUS } from '../../../types/courseAssignmentStatusValues';

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

const findOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;
const getActiveModulesByCourseMock = courseProgress.getActiveModulesByCourse as unknown as jest.Mock;
const getCompletedTaskIdsMock = courseProgress.getCompletedTaskIds as unknown as jest.Mock;
const getActiveTasksByModuleMock = courseProgress.getActiveTasksByModule as unknown as jest.Mock;
const buildCourseModulesMock = courseProgress.buildCourseModules as unknown as jest.Mock;
const summariseProgressMock = courseProgress.summariseProgress as unknown as jest.Mock;
const deriveAssignmentStatusMock = courseProgress.deriveAssignmentStatus as unknown as jest.Mock;
const getCourseMediaSignedUrlMock = courseMedia.getCourseMediaSignedUrl as unknown as jest.Mock;

const buildFindOneChain = (assignment: any) => {
    findOneMock.mockReturnValue({
        populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(assignment)
        })
    });
};

const setupProgress = () => {
    getActiveModulesByCourseMock.mockResolvedValue(
        new Map([['c1', [{ _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1' }]]])
    );
    getCompletedTaskIdsMock.mockResolvedValue(new Map());
    getActiveTasksByModuleMock.mockResolvedValue(new Map([['m1', [{ _id: 't1', title: 'Task 1' }]]]));
    buildCourseModulesMock.mockReturnValue([
        { _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1', tasks: [{ _id: 't1' }] }
    ]);
    summariseProgressMock.mockReturnValue({ completedTasks: 1, totalTasks: 2 });
    deriveAssignmentStatusMock.mockReturnValue(COURSE_ASSIGNMENT_STATUS.COMPLETED);
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

    const setupUser = (employee: any) => {
        userFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(employee) })
        });
    };

    it('returns the full course assignment detail with a signed thumbnail', async () => {
        buildFindOneChain(buildAssignment());
        setupUser({ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeId: 'EMP01' });
        setupProgress();
        getCourseMediaSignedUrlMock.mockResolvedValue('signed-url');

        const result = await getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails('a1');

        expect(findOneMock).toHaveBeenCalledTimes(1);
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'a1' });
        expect((findOneMock.mock.results[0].value as any).populate).toHaveBeenCalledWith({
            path: 'courseId',
            model: CourseModel
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
                status: COURSE_ASSIGNMENT_STATUS.COMPLETED,
                isOverdue: false,
                totalModules: 1
            }
        });
    });

    it('returns success false when the assignment is not found', async () => {
        buildFindOneChain(null);

        const result = await getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails('a9');

        expect(result).toEqual({ success: false });
        expect(userFindByIdMock).not.toHaveBeenCalled();
    });

    it('returns success false when the assignment has no course', async () => {
        buildFindOneChain({ _id: 'a1', courseId: null });

        const result = await getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails('a1');

        expect(result).toEqual({ success: false });
    });

    it('returns an empty thumbnail url and null employee when they are missing', async () => {
        const assignment = buildAssignment();
        (assignment.courseId as any).thumbnail = undefined;
        buildFindOneChain(assignment);
        setupUser(null);
        setupProgress();
        const result = await getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails('a1');
        const course = (result as any).course;

        expect(getCourseMediaSignedUrlMock).not.toHaveBeenCalled();
        expect(course.thumbnailUrl).toBe('');
        expect((result as any).employee).toBeNull();
    });

    it('swallows thumbnail signing failures', async () => {
        buildFindOneChain(buildAssignment());
        setupUser(null);
        setupProgress();
        getCourseMediaSignedUrlMock.mockRejectedValue(new Error('S3 failure'));

        const result = await getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails('a1');

        expect(getCourseMediaSignedUrlMock).toHaveBeenCalledTimes(1);
        expect((result as any).course.thumbnailUrl).toBe('');
    });
});