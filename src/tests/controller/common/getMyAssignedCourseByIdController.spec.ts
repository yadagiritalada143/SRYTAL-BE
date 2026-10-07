import { Request, Response } from 'express';
import getMyAssignedCourseByIdController from '../../../controllers/common/getMyAssignedCourseByIdController';
import getMyAssignedCourseByIdService from '../../../services/common/getMyAssignedCourseByIdService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES } from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/getMyAssignedCourseByIdService', () => ({
    __esModule: true,
    default: { getMyAssignedCourseById: jest.fn() }
}));

const getMyAssignedCourseByIdServiceMock =
    getMyAssignedCourseByIdService.getMyAssignedCourseById as unknown as jest.Mock;

describe('getMyAssignedCourseByIdController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getMyAssignedCourseByIdServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the course detail on success', async () => {
        const req = {
            params: { courseAssignmentId: 'assign1' },
            user: { userId: 'emp1' }
        } as unknown as Request;
        const courseResponse = { success: true, course: { courseAssignmentId: 'assign1' } };
        getMyAssignedCourseByIdServiceMock.mockResolvedValue(courseResponse);

        await getMyAssignedCourseByIdController.getMyAssignedCourseById(req, res);

        expect(getMyAssignedCourseByIdServiceMock).toHaveBeenCalledWith('assign1', 'emp1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(courseResponse);
    });

    it('returns 404 when the service reports the course is not found', async () => {
        const req = {
            params: { courseAssignmentId: 'assign1' },
            user: { userId: 'emp1' }
        } as unknown as Request;
        getMyAssignedCourseByIdServiceMock.mockResolvedValue({ success: false });

        await getMyAssignedCourseByIdController.getMyAssignedCourseById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            params: { courseAssignmentId: 'assign1' },
            user: { userId: 'emp1' }
        } as unknown as Request;
        getMyAssignedCourseByIdServiceMock.mockRejectedValue(new Error('boom'));

        await getMyAssignedCourseByIdController.getMyAssignedCourseById(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSE_FETCH_ERROR_MESSAGE
        });
    });

    it('calls the service with undefined when the request has no user', async () => {
        const req = { params: { courseAssignmentId: 'assign1' } } as unknown as Request;
        getMyAssignedCourseByIdServiceMock.mockResolvedValue({ success: true });

        await getMyAssignedCourseByIdController.getMyAssignedCourseById(req, res);

        expect(getMyAssignedCourseByIdServiceMock).toHaveBeenCalledWith('assign1', undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
});