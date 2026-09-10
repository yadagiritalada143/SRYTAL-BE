import updateCourseAssignmentDueDateService from '../../../services/admin/updateCourseAssignmentDueDateService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import UserModel from '../../../model/userModel';
import CourseModel from '../../../model/coursesModel';
import sendCourseDueDateUpdateEmail from '../../../util/sendCourseDueDateUpdateEmail';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../../constants/admin/courseAssignmentMessages';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/userModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../util/sendCourseDueDateUpdateEmail', () => ({
    __esModule: true,
    default: { sendCourseDueDateUpdateEmail: jest.fn() }
}));

const findByIdMock = (CourseAssignment as unknown as { findById: jest.Mock }).findById;
const userFindByIdMock = (UserModel as unknown as { findById: jest.Mock }).findById;
const courseFindByIdMock = (CourseModel as unknown as { findById: jest.Mock }).findById;
const sendCourseDueDateUpdateEmailMock =
    sendCourseDueDateUpdateEmail.sendCourseDueDateUpdateEmail as unknown as jest.Mock;

const buildSelectLeanQuery = (value: any) => ({
    select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(value) })
});

describe('updateCourseAssignmentDueDateService', () => {
    let saveSpy: jest.Mock;
    let assignmentDoc: any;

    beforeEach(() => {
        findByIdMock.mockReset();
        userFindByIdMock.mockReset();
        courseFindByIdMock.mockReset();
        sendCourseDueDateUpdateEmailMock.mockReset();
        sendCourseDueDateUpdateEmailMock.mockResolvedValue(undefined);
        saveSpy = jest.fn();
        assignmentDoc = {
            _id: 'a1',
            employeeId: 'e1',
            courseId: 'c1',
            dueDate: new Date('2026-02-01'),
            save: saveSpy
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('rejects when the due date is invalid', async () => {
        await expect(updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate('a1', null as any)).rejects.toThrow(
            'Invalid due date'
        );

        expect(findByIdMock).not.toHaveBeenCalled();
    });

    it('rejects with the not found message when the assignment does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        await expect(
            updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate('a1', new Date('2026-12-01'))
        ).rejects.toThrow(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE);

        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith('a1');
    });

    it('updates the due date and dispatches the email when extended', async () => {
        const oldDueDate = new Date('2026-02-01');
        const newDueDate = new Date('2026-12-01');
        findByIdMock.mockResolvedValue(assignmentDoc);
        const saved = { _id: 'a1', dueDate: newDueDate };
        saveSpy.mockResolvedValue(saved);
        userFindByIdMock.mockReturnValue(
            buildSelectLeanQuery({ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'john@x.com' })
        );
        courseFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro' }));

        const result = await updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate('a1', newDueDate);

        expect(findByIdMock).toHaveBeenCalledTimes(1);
        expect(findByIdMock).toHaveBeenCalledWith('a1');
        expect(assignmentDoc.save).toHaveBeenCalledTimes(1);
        expect(userFindByIdMock).toHaveBeenCalledWith('e1');
        expect(courseFindByIdMock).toHaveBeenCalledWith('c1');
        expect(sendCourseDueDateUpdateEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseDueDateUpdateEmailMock).toHaveBeenCalledWith({
            employeeName: 'John Doe',
            employeeEmail: 'john@x.com',
            courseName: 'Intro',
            oldDueDate,
            newDueDate,
            isExtended: true
        });
        expect(result).toEqual(saved);
    });

    it('dispatches the email with isExtended false when the due date is moved earlier', async () => {
        const newDueDate = new Date('2026-01-01');
        findByIdMock.mockResolvedValue(assignmentDoc);
        saveSpy.mockResolvedValue({ _id: 'a1', dueDate: newDueDate });
        userFindByIdMock.mockReturnValue(
            buildSelectLeanQuery({ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'john@x.com' })
        );
        courseFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro' }));

        await updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate('a1', newDueDate);

        expect(sendCourseDueDateUpdateEmailMock).toHaveBeenCalledTimes(1);
        expect(sendCourseDueDateUpdateEmailMock).toHaveBeenCalledWith(
            expect.objectContaining({ isExtended: false })
        );
    });

    it('returns the saved assignment when the email dispatch fails', async () => {
        const newDueDate = new Date('2026-12-01');
        findByIdMock.mockResolvedValue(assignmentDoc);
        const saved = { _id: 'a1', dueDate: newDueDate };
        saveSpy.mockResolvedValue(saved);
        userFindByIdMock.mockReturnValue(
            buildSelectLeanQuery({ _id: 'e1', firstName: 'John', lastName: 'Doe', email: 'john@x.com' })
        );
        courseFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro' }));
        sendCourseDueDateUpdateEmailMock.mockRejectedValue(new Error('Email failed'));

        const result = await updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate('a1', newDueDate);

        expect(result).toEqual(saved);
        expect(sendCourseDueDateUpdateEmailMock).toHaveBeenCalledTimes(1);
    });

    it('skips the email when the employee has no email address', async () => {
        const newDueDate = new Date('2026-12-01');
        findByIdMock.mockResolvedValue(assignmentDoc);
        saveSpy.mockResolvedValue({ _id: 'a1' });
        userFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'e1', firstName: 'John', email: undefined }));
        courseFindByIdMock.mockReturnValue(buildSelectLeanQuery({ _id: 'c1', courseName: 'Intro' }));

        const result = await updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate('a1', newDueDate);

        expect(result).toEqual({ _id: 'a1' });
        expect(sendCourseDueDateUpdateEmailMock).not.toHaveBeenCalled();
    });
});