import { Request, Response } from 'express';
import deleteCourseAssignmentController from '../../../controllers/admin/deleteCourseAssignmentController';
import deleteCourseAssignmentService from '../../../services/admin/deleteCourseAssignmentService';
import {
    COURSE_ASSIGNMENT_SUCCESS_MESSAGES,
    COURSE_ASSIGNMENT_ERRORS_MESSAGES
} from '../../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/deleteCourseAssignmentService', () => ({
    __esModule: true,
    default: {
        deleteCourseAssignment: jest.fn()
    }
}));

const deleteCourseAssignmentServiceMock = deleteCourseAssignmentService.deleteCourseAssignment as unknown as jest.Mock;

describe('deleteCourseAssignment controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        deleteCourseAssignmentServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when the assignment id is missing', async () => {
        const req = { params: {} } as unknown as Request;

        await deleteCourseAssignmentController.deleteCourseAssignment(req, res);

        expect(deleteCourseAssignmentServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE
        });
    });

    it('returns 200 with the delete success message when the assignment is deleted', async () => {
        const req = { params: { courseAssignmentId: 'a1' } } as unknown as Request;
        deleteCourseAssignmentServiceMock.mockResolvedValue({ _id: 'a1' });

        await deleteCourseAssignmentController.deleteCourseAssignment(req, res);

        expect(deleteCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(deleteCourseAssignmentServiceMock).toHaveBeenCalledWith('a1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DELETE_SUCCESS_MESSAGE
        });
    });

    it('returns 404 when the service reports the assignment was not found', async () => {
        const req = { params: { courseAssignmentId: 'a9' } } as unknown as Request;
        deleteCourseAssignmentServiceMock.mockRejectedValue(
            new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE)
        );

        await deleteCourseAssignmentController.deleteCourseAssignment(req, res);

        expect(deleteCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 with the delete error for any other service error', async () => {
        const req = { params: { courseAssignmentId: 'a1' } } as unknown as Request;
        deleteCourseAssignmentServiceMock.mockRejectedValue(new Error('Unexpected failure'));

        await deleteCourseAssignmentController.deleteCourseAssignment(req, res);

        expect(deleteCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DELETE_ERROR_MESSAGE
        });
    });
});