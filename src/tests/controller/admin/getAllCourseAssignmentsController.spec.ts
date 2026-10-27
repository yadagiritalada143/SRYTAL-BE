import { Request, Response } from 'express';
import getAllCourseAssignmentsController from '../../../controllers/admin/getAllCourseAssignmentsController';
import getAllCourseAssignmentsService from '../../../services/admin/getAllCourseAssignmentsService';
import {
    COURSE_ASSIGNMENT_SUCCESS_MESSAGES,
    COURSE_ASSIGNMENT_ERRORS_MESSAGES
} from '../../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getAllCourseAssignmentsService', () => ({
    __esModule: true,
    default: {
        getAllCourseAssignments: jest.fn()
    }
}));

const getAllCourseAssignmentsServiceMock = getAllCourseAssignmentsService.getAllCourseAssignments as unknown as jest.Mock;

describe('getAllCourseAssignments controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAllCourseAssignmentsServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the fetched assignments and pagination', async () => {
        const req = {
            query: { employeeId: 'e1', employeeName: 'John', page: '2', limit: '5' }
        } as unknown as Request;
        const result = { data: [{ _id: 'a1' }], pagination: { page: 2, limit: 5, total: 1, totalPages: 1 } };
        getAllCourseAssignmentsServiceMock.mockResolvedValue(result);

        await getAllCourseAssignmentsController.getAllCourseAssignments(req, res);

        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledTimes(1);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledWith({
            employeeId: 'e1',
            employeeName: 'John',
            page: 2,
            limit: 5
        });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_FETCH_SUCCESS_MESSAGE,
            data: result.data,
            pagination: result.pagination
        });
    });

    it('passes undefined for non-string and empty page/limit values', async () => {
        const req = {
            query: { employeeId: ['e1'], employeeName: '', page: '', limit: undefined }
        } as unknown as Request;
        getAllCourseAssignmentsServiceMock.mockResolvedValue({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

        await getAllCourseAssignmentsController.getAllCourseAssignments(req, res);

        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledTimes(1);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledWith({
            employeeId: undefined,
            employeeName: '',
            page: undefined,
            limit: undefined
        });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { query: {} } as unknown as Request;
        getAllCourseAssignmentsServiceMock.mockRejectedValue(
            new Error(COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE)
        );

        await getAllCourseAssignmentsController.getAllCourseAssignments(req, res);

        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE
        });
    });
});