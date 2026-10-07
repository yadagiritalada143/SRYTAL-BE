import { Request, Response } from 'express';
import updateCourseAssignmentDueDateController from '../../../controllers/admin/updateCourseAssignmentDueDateController';
import updateCourseAssignmentDueDateService from '../../../services/admin/updateCourseAssignmentDueDateService';
import {
    COURSE_ASSIGNMENT_SUCCESS_MESSAGES,
    COURSE_ASSIGNMENT_ERRORS_MESSAGES
} from '../../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/updateCourseAssignmentDueDateService', () => ({
    __esModule: true,
    default: {
        updateCourseAssignmentDueDate: jest.fn()
    }
}));

const updateCourseAssignmentDueDateServiceMock =
    updateCourseAssignmentDueDateService.updateCourseAssignmentDueDate as unknown as jest.Mock;

describe('updateCourseAssignmentDueDate controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        updateCourseAssignmentDueDateServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when the assignment id or due date is missing', async () => {
        const req = { params: { courseAssignmentId: 'a1' }, body: {} } as unknown as Request;

        await updateCourseAssignmentDueDateController.updateCourseAssignmentDueDate(req, res);

        expect(updateCourseAssignmentDueDateServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'courseAssignmentId and dueDate are required !'
        });
    });

    it('returns 200 with the updated assignment when the service resolves', async () => {
        const req = {
            params: { courseAssignmentId: 'a1' },
            body: { dueDate: new Date('2026-12-01') }
        } as unknown as Request;
        const updated = { _id: 'a1', dueDate: new Date('2026-12-01') };
        updateCourseAssignmentDueDateServiceMock.mockResolvedValue(updated);

        await updateCourseAssignmentDueDateController.updateCourseAssignmentDueDate(req, res);

        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledTimes(1);
        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledWith('a1', expect.any(Date));
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: 'Course assignment due date updated successfully !',
            data: updated
        });
    });

    it('returns 404 when the service reports the assignment was not found', async () => {
        const req = {
            params: { courseAssignmentId: 'a9' },
            body: { dueDate: new Date('2026-12-01') }
        } as unknown as Request;
        updateCourseAssignmentDueDateServiceMock.mockRejectedValue(
            new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE)
        );

        await updateCourseAssignmentDueDateController.updateCourseAssignmentDueDate(req, res);

        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
        });
    });

    it('returns 400 for any other service error', async () => {
        const req = {
            params: { courseAssignmentId: 'a1' },
            body: { dueDate: new Date('2026-12-01') }
        } as unknown as Request;
        updateCourseAssignmentDueDateServiceMock.mockRejectedValue(new Error('Unexpected failure'));

        await updateCourseAssignmentDueDateController.updateCourseAssignmentDueDate(req, res);

        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'Error occurred while updating course assignment due date !'
        });
    });
});