import { Request, Response } from 'express';
import fetchAssignedCoursesForEmployeeController from '../../../controllers/admin/fetchAssignedCoursesForEmployeeController';
import fetchAssignedCoursesForEmployeeService from '../../../services/admin/fetchAssignedCoursesForEmployeeService';
import {
    COURSE_ASSIGNMENT_SUCCESS_MESSAGES,
    COURSE_ASSIGNMENT_ERRORS_MESSAGES
} from '../../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/fetchAssignedCoursesForEmployeeService', () => ({
    __esModule: true,
    default: {
        fetchAssignedCoursesForEmployee: jest.fn()
    }
}));

const fetchAssignedCoursesForEmployeeMock =
    fetchAssignedCoursesForEmployeeService.fetchAssignedCoursesForEmployee as unknown as jest.Mock;

describe('fetchAssignedCoursesForEmployee controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson, set: jest.fn() } as unknown as Response;
        fetchAssignedCoursesForEmployeeMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with assigned courses for a valid userId', async () => {
        const req = { params: { userId: '64f123456789abcdef123456' } } as unknown as Request;
        const serviceResult = {
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_FETCH_SUCCESS_MESSAGE,
            data: [
                {
                    courseAssignmentId: 'a1',
                    courseId: 'c1',
                    courseName: 'Node.js',
                    description: 'Learn Node.js',
                    status: 'Assigned',
                    assignedDate: new Date('2026-09-01'),
                    dueDate: new Date('2026-09-30'),
                    assignedBy: 'admin1'
                }
            ]
        };
        fetchAssignedCoursesForEmployeeMock.mockResolvedValue(serviceResult);

        await fetchAssignedCoursesForEmployeeController.fetchAssignedCoursesForEmployee(req, res);

        expect(fetchAssignedCoursesForEmployeeMock).toHaveBeenCalledWith('64f123456789abcdef123456');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(serviceResult);
    });

    it('returns 200 with empty data when employee has no assigned courses', async () => {
        const req = { params: { userId: '64f123456789abcdef123456' } } as unknown as Request;
        const serviceResult = {
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.ASSIGNED_COURSES_NO_COURSES_MESSAGE,
            data: []
        };
        fetchAssignedCoursesForEmployeeMock.mockResolvedValue(serviceResult);

        await fetchAssignedCoursesForEmployeeController.fetchAssignedCoursesForEmployee(req, res);

        expect(fetchAssignedCoursesForEmployeeMock).toHaveBeenCalledWith('64f123456789abcdef123456');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(serviceResult);
    });

    it('returns 404 when employee is not found', async () => {
        const req = { params: { userId: '507f1f77bcf86cd799439011' } } as unknown as Request;
        fetchAssignedCoursesForEmployeeMock.mockRejectedValue(
            new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE)
        );

        await fetchAssignedCoursesForEmployeeController.fetchAssignedCoursesForEmployee(req, res);

        expect(fetchAssignedCoursesForEmployeeMock).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_EMPLOYEE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 500 on unexpected service error', async () => {
        const req = { params: { userId: '64f123456789abcdef123456' } } as unknown as Request;
        fetchAssignedCoursesForEmployeeMock.mockRejectedValue(new Error('Database failure'));

        await fetchAssignedCoursesForEmployeeController.fetchAssignedCoursesForEmployee(req, res);

        expect(fetchAssignedCoursesForEmployeeMock).toHaveBeenCalledWith('64f123456789abcdef123456');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.ASSIGNED_COURSES_FETCH_ERROR_MESSAGE
        });
    });
});
