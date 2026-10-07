import deleteCourseAssignmentService from '../../../services/admin/deleteCourseAssignmentService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import { COURSE_ASSIGNMENT_ERRORS_MESSAGES } from '../../../constants/admin/courseAssignmentMessages';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));

const findByIdAndDeleteMock = (CourseAssignment as unknown as { findByIdAndDelete: jest.Mock }).findByIdAndDelete;

describe('deleteCourseAssignmentService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the deleted assignment when it exists', async () => {
        const deleted = { _id: 'a1', courseId: 'c1' };
        findByIdAndDeleteMock.mockResolvedValue(deleted);

        const result = await deleteCourseAssignmentService.deleteCourseAssignment('a1');

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('a1');
        expect(result).toEqual(deleted);
    });

    it('rejects with the invalid id message when no id is provided', async () => {
        await expect(deleteCourseAssignmentService.deleteCourseAssignment('')).rejects.toThrow(
            COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE
        );

        expect(findByIdAndDeleteMock).not.toHaveBeenCalled();
    });

    it('rejects with the not found message when the assignment does not exist', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);

        await expect(deleteCourseAssignmentService.deleteCourseAssignment('a9')).rejects.toThrow(
            COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
        );

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
    });

    it('propagates database errors', async () => {
        const dbError = new Error('Database failure');
        findByIdAndDeleteMock.mockRejectedValue(dbError);

        await expect(deleteCourseAssignmentService.deleteCourseAssignment('a1')).rejects.toThrow(dbError);

        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
    });
});