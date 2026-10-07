import getAllCourseAssignmentsService from '../../../services/admin/getAllCourseAssignmentsService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModel from '../../../model/coursesModel';
import UserModel from '../../../model/userModel';
import courseProgress from '../../../util/manageCourseProgress';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../../constants/admin/courseAssignmentMessages';
import { COURSE_ASSIGNMENT_STATUS } from '../../../types/courseAssignmentStatusValues';

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
    default: { find: jest.fn() }
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

const findMock = (CourseAssignment as unknown as { find: jest.Mock }).find;
const userFindMock = (UserModel as unknown as { find: jest.Mock }).find;
const getActiveModulesByCourseMock = courseProgress.getActiveModulesByCourse as unknown as jest.Mock;
const getCompletedTaskIdsMock = courseProgress.getCompletedTaskIds as unknown as jest.Mock;
const getActiveTasksByModuleMock = courseProgress.getActiveTasksByModule as unknown as jest.Mock;
const buildCourseModulesMock = courseProgress.buildCourseModules as unknown as jest.Mock;
const summariseProgressMock = courseProgress.summariseProgress as unknown as jest.Mock;
const deriveAssignmentStatusMock = courseProgress.deriveAssignmentStatus as unknown as jest.Mock;

const buildFindChain = (assignments: any[]) => {
    const populateFn = jest.fn();
    const sortFn = jest.fn();
    const leanFn = jest.fn();
    populateFn.mockReturnValue({ sort: sortFn });
    sortFn.mockReturnValue({ lean: leanFn });
    leanFn.mockResolvedValue(assignments);
    findMock.mockReturnValue({ populate: populateFn });
    return { populateFn, sortFn, leanFn };
};

const setupProgress = () => {
    getActiveModulesByCourseMock.mockImplementation((courseIds: string[]) =>
        Promise.resolve(new Map(courseIds.map((id: string) => [id, [{ _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1' }]])))
    );
    getCompletedTaskIdsMock.mockResolvedValue(new Map());
    getActiveTasksByModuleMock.mockResolvedValue(new Map([['m1', [{ _id: 't1', title: 'Task 1' }]]]));
    buildCourseModulesMock.mockReturnValue([
        {
            _id: 'm1',
            moduleName: 'Module 1',
            moduleDescription: 'Desc 1',
            tasks: [{ _id: 't1', title: 'Task 1' }],
            taskIdsForProgress: ['t1'],
            completedTaskIds: ['t1']
        }
    ]);
    summariseProgressMock.mockReturnValue({ completedTasks: 1, totalTasks: 2, percent: 50 });
    deriveAssignmentStatusMock.mockReturnValue(COURSE_ASSIGNMENT_STATUS.COMPLETED);
};

describe('getAllCourseAssignmentsService', () => {
    beforeEach(() => {
        findMock.mockReset();
        userFindMock.mockReset();
        getActiveModulesByCourseMock.mockReset();
        getCompletedTaskIdsMock.mockReset();
        getActiveTasksByModuleMock.mockReset();
        buildCourseModulesMock.mockReset();
        summariseProgressMock.mockReset();
        deriveAssignmentStatusMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const setupUsers = (employees: any[]) => {
        userFindMock.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(employees) })
        });
    };

    it('returns enriched assignments with pagination', async () => {
        const assignments = [
            {
                _id: 'a1',
                courseId: { _id: 'c1', courseName: 'Intro', courseDescription: 'desc' },
                employeeId: 'e1',
                assignedAt: new Date('2026-01-01'),
                dueDate: new Date('2026-12-01'),
                completedAt: null
            },
            { _id: 'a2', courseId: null, employeeId: 'e2', assignedAt: new Date('2026-01-01'), dueDate: null }
        ];
        const employees = [{ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeId: 'EMP01' }];
        const { populateFn, sortFn } = buildFindChain(assignments);
        setupUsers(employees);
        setupProgress();

        const result = await getAllCourseAssignmentsService.getAllCourseAssignments();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(findMock).toHaveBeenCalledWith({});
        expect(populateFn).toHaveBeenCalledWith({
            path: 'courseId',
            model: CourseModel
        });
        expect(sortFn).toHaveBeenCalledWith({ assignedAt: -1 });
        expect(getActiveModulesByCourseMock).toHaveBeenCalledWith(['c1']);
        expect(getCompletedTaskIdsMock).toHaveBeenCalledWith(['a1']);
        expect(userFindMock).toHaveBeenCalledWith({ _id: { $in: ['e1'] } });
        expect(getActiveTasksByModuleMock).toHaveBeenCalledWith(['m1']);
        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toMatchObject({
            courseAssignmentId: 'a1',
            courseId: 'c1',
            courseName: 'Intro',
            status: COURSE_ASSIGNMENT_STATUS.COMPLETED,
            totalModules: 1,
            isOverdue: false,
            employee: {
                employeeId: 'e1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'j@x.com',
                employeeCode: 'EMP01'
            }
        });
        expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('returns an empty dataset when no valid assignments exist', async () => {
        buildFindChain([{ _id: 'a1', courseId: null }]);

        const result = await getAllCourseAssignmentsService.getAllCourseAssignments();

        expect(result).toEqual({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        expect(getActiveModulesByCourseMock).not.toHaveBeenCalled();
        expect(userFindMock).not.toHaveBeenCalled();
    });

    it('applies pagination to the enriched results', async () => {
        const assignments = [
            {
                _id: 'a1',
                courseId: { _id: 'c1', courseName: 'Intro', courseDescription: 'desc' },
                employeeId: 'e1',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            },
            {
                _id: 'a2',
                courseId: { _id: 'c2', courseName: 'Advanced', courseDescription: 'desc2' },
                employeeId: 'e2',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            }
        ];
        const employees = [
            { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeId: 'EMP01' },
            { _id: 'e2', firstName: 'Jane', lastName: 'Roe', email: 'jr@x.com', employeeId: 'EMP02' }
        ];
        buildFindChain(assignments);
        setupUsers(employees);
        setupProgress();

        const result = await getAllCourseAssignmentsService.getAllCourseAssignments({ page: 2, limit: 1 });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].courseAssignmentId).toBe('a2');
        expect(result.pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    });

    it('filters by employee name', async () => {
        const assignments = [
            {
                _id: 'a1',
                courseId: { _id: 'c1', courseName: 'Intro', courseDescription: 'desc' },
                employeeId: 'e1',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            },
            {
                _id: 'a2',
                courseId: { _id: 'c2', courseName: 'Advanced', courseDescription: 'desc2' },
                employeeId: 'e2',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            },
            {
                _id: 'a3',
                courseId: { _id: 'c3', courseName: 'Basics', courseDescription: 'desc3' },
                employeeId: 'e3',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            }
        ];
        const employees = [
            { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeId: 'EMP01' },
            { _id: 'e2', firstName: 'Jane', lastName: 'Roe', email: 'jr@x.com', employeeId: 'EMP02' }
        ];
        buildFindChain(assignments);
        setupUsers(employees);
        setupProgress();

        const result = await getAllCourseAssignmentsService.getAllCourseAssignments({ employeeName: 'Jane' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].courseAssignmentId).toBe('a2');
        expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('filters by employee id and drops assignments without an employee', async () => {
        const assignments = [
            {
                _id: 'a1',
                courseId: { _id: 'c1', courseName: 'Intro', courseDescription: 'desc' },
                employeeId: 'e1',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            },
            {
                _id: 'a2',
                courseId: { _id: 'c2', courseName: 'Advanced', courseDescription: 'desc2' },
                employeeId: 'e2',
                assignedAt: new Date('2026-01-01'),
                dueDate: null
            }
        ];
        const employees = [{ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'j@x.com', employeeId: 'EMP01' }];
        buildFindChain(assignments);
        setupUsers(employees);
        setupProgress();

        const result = await getAllCourseAssignmentsService.getAllCourseAssignments({ employeeId: 'emp01' });

        expect(result.data).toHaveLength(1);
        expect(result.data[0].courseAssignmentId).toBe('a1');
        expect(result.pagination.total).toBe(1);
    });

    it('rethrows the fetch error when the assignment query fails', async () => {
        findMock.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValue(new Error('Database failure'))
                })
            })
        });

        await expect(getAllCourseAssignmentsService.getAllCourseAssignments()).rejects.toThrow(
            COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE
        );
    });
});