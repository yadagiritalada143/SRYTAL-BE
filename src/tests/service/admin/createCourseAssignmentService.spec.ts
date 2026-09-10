import createCourseAssignmentService from '../../../services/admin/createCourseAssignmentService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import UserModel from '../../../model/userModel';
import CourseModel from '../../../model/coursesModel';
import courseProgress from '../../../util/manageCourseProgress';
import sendCourseAssignmentEmail from '../../../util/sendCourseAssignmentEmail';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../../constants/admin/courseAssignmentMessages';

jest.mock('../../../model/courseAssignmentModel', () => {
    const CourseAssignment = jest.fn();
    (CourseAssignment as any).findOne = jest.fn();
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

const CourseAssignmentMock = CourseAssignment as unknown as jest.Mock & { findOne: jest.Mock };
const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;
const courseFindByIdMock = (CourseModel as unknown as { findById: jest.Mock }).findById;
const getActiveModulesByCourseMock = courseProgress.getActiveModulesByCourse as unknown as jest.Mock;
const sendCourseAssignmentEmailMock = sendCourseAssignmentEmail.sendCourseAssignmentEmail as unknown as jest.Mock;

const buildSelectLeanQuery = (value: any) => ({
    select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) })
});

describe('createCourseAssignmentService', () => {
    let saveSpy: jest.Mock;

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
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const setupData = () => {
        const employee = { _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'john@x.com' };
        const admin = { _id: 'u-admin', firstName: 'Admin', lastName: 'One' };
        userFindByIdMock.mockImplementation((id: string) =>
            buildSelectLeanQuery(id === 'u-admin' ? admin : employee)
        );
        courseFindByIdMock.mockReturnValue(
            buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro', courseDescription: 'desc' })
        );
        getActiveModulesByCourseMock.mockResolvedValue(
            new Map([['c1', [{ _id: 'm1', moduleName: 'Module 1', moduleDescription: 'Desc 1' }]]])
        );
        return { employee, admin };
    };

    it('creates an assignment and dispatches the assignment email', async () => {
        const { admin } = setupData();
        const dueDate = new Date('2026-12-01');
        CourseAssignmentMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'a1', courseId: 'c1', employeeId: 'e1' };
        saveSpy.mockResolvedValue(saved);

        const result = await createCourseAssignmentService.createCourseAssignment('c1', 'e1', 'u-admin', dueDate);

        expect(CourseAssignmentMock.findOne).toHaveBeenCalledTimes(1);
        expect(CourseAssignmentMock.findOne).toHaveBeenCalledWith({ courseId: 'c1', employeeId: 'e1' });
        expect(CourseAssignmentMock).toHaveBeenCalledWith(
            expect.objectContaining({
                courseId: 'c1',
                employeeId: 'e1',
                assignedByAdminId: 'u-admin',
                status: 'Assigned',
                assignedAt: expect.any(Date),
                dueDate,
                completedAt: null
            })
        );
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

        await expect(
            createCourseAssignmentService.createCourseAssignment('c1', 'e1', 'u-admin', new Date('2026-12-01'))
        ).rejects.toThrow(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE);

        expect(CourseAssignmentMock.findOne).toHaveBeenCalledTimes(1);
        expect(saveSpy).not.toHaveBeenCalled();
    });

    it('rejects when the course id is missing', async () => {
        await expect(
            createCourseAssignmentService.createCourseAssignment('', 'e1', 'u-admin', new Date('2026-12-01'))
        ).rejects.toThrow('Invalid course ID');
    });

    it('rejects when the employee id is missing', async () => {
        await expect(
            createCourseAssignmentService.createCourseAssignment('c1', '', 'u-admin', new Date('2026-12-01'))
        ).rejects.toThrow('Invalid employee ID');
    });

    it('returns the saved assignment when the email dispatch fails', async () => {
        setupData();
        const dueDate = new Date('2026-12-01');
        CourseAssignmentMock.findOne.mockResolvedValue(null);
        const saved = { _id: 'a1' };
        saveSpy.mockResolvedValue(saved);
        sendCourseAssignmentEmailMock.mockRejectedValue(new Error('Email failed'));

        const result = await createCourseAssignmentService.createCourseAssignment('c1', 'e1', 'u-admin', dueDate);

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

        const result = await createCourseAssignmentService.createCourseAssignment(
            'c1',
            'e1',
            undefined as unknown as string,
            dueDate
        );

        expect(result).toEqual(saved);
        expect(sendCourseAssignmentEmailMock).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by the assignment lookup', async () => {
        const modelError = new Error('Lookup failed');
        CourseAssignmentMock.findOne.mockRejectedValue(modelError);

        await expect(
            createCourseAssignmentService.createCourseAssignment('c1', 'e1', 'u-admin', new Date('2026-12-01'))
        ).rejects.toThrow(modelError);
    });
});