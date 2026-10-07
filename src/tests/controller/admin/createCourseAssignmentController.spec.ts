import { Request, Response } from 'express';
import createCourseAssignmentController from '../../../controllers/admin/createCourseAssignmentController';
import createCourseAssignmentService from '../../../services/admin/createCourseAssignmentService';
import {
    COURSE_ASSIGNMENT_SUCCESS_MESSAGES,
    COURSE_ASSIGNMENT_ERRORS_MESSAGES
} from '../../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/createCourseAssignmentService', () => ({
    __esModule: true,
    default: {
        createCourseAssignment: jest.fn()
    }
}));

const createCourseAssignmentServiceMock = createCourseAssignmentService.createCourseAssignment as unknown as jest.Mock;

describe('createCourseAssignment controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        createCourseAssignmentServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when a required field is missing', async () => {
        const req = { body: { courseId: 'c1', employeeId: 'e1' } } as unknown as Request;

        await createCourseAssignmentController.createCourseAssignment(req, res);

        expect(createCourseAssignmentServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 201 with the created assignment when the service resolves', async () => {
        const req = {
            body: { courseId: 'c1', employeeId: 'e1', dueDate: new Date('2026-12-01') },
            user: { userId: 'u-admin' }
        } as unknown as Request;
        const created = { _id: 'a1' };
        createCourseAssignmentServiceMock.mockResolvedValue(created);

        await createCourseAssignmentController.createCourseAssignment(req, res);

        expect(createCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(createCourseAssignmentServiceMock).toHaveBeenCalledWith(
            'c1',
            'e1',
            'u-admin',
            expect.any(Date)
        );
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_CREATE_SUCCESS_MESSAGE,
            data: created
        });
    });

    it('returns 409 when the course is already assigned to the employee', async () => {
        const req = {
            body: { courseId: 'c1', employeeId: 'e1', dueDate: new Date('2026-12-01') },
            user: { userId: 'u-admin' }
        } as unknown as Request;
        createCourseAssignmentServiceMock.mockRejectedValue(
            new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE)
        );

        await createCourseAssignmentController.createCourseAssignment(req, res);

        expect(createCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE
        });
    });

    it('returns 400 with the create error for any other service error', async () => {
        const req = {
            body: { courseId: 'c1', employeeId: 'e1', dueDate: new Date('2026-12-01') },
            user: { userId: 'u-admin' }
        } as unknown as Request;
        createCourseAssignmentServiceMock.mockRejectedValue(new Error('Unexpected failure'));

        await createCourseAssignmentController.createCourseAssignment(req, res);

        expect(createCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_CREATE_ERROR_MESSAGE
        });
    });
});