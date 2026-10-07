import { Request, Response } from 'express';
import getMyAssignedCoursesController from '../../../controllers/common/getMyAssignedCoursesController';
import getMyAssignedCoursesService from '../../../services/common/getMyAssignedCoursesService';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';
import { MY_COURSES_ERROR_MESSAGES } from '../../../constants/common/myCoursesMessages';

jest.mock('../../../services/common/getMyAssignedCoursesService', () => ({
    __esModule: true,
    default: { getMyAssignedCourses: jest.fn() }
}));

const getMyAssignedCoursesServiceMock = getMyAssignedCoursesService.getMyAssignedCourses as unknown as jest.Mock;
const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getMyAssignedCoursesController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getMyAssignedCoursesServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the courses on success', async () => {
        const req = { user: { userId: 'emp1' } } as unknown as Request;
        const coursesResponse = { success: true, courses: [] };
        getMyAssignedCoursesServiceMock.mockResolvedValue(coursesResponse);

        await getMyAssignedCoursesController.getMyAssignedCourses(req, res);
        await flushMicrotasks();

        expect(getMyAssignedCoursesServiceMock).toHaveBeenCalledWith('emp1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(coursesResponse);
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'emp1' } } as unknown as Request;
        getMyAssignedCoursesServiceMock.mockRejectedValue(new Error('boom'));

        await getMyAssignedCoursesController.getMyAssignedCourses(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: MY_COURSES_ERROR_MESSAGES.MY_COURSES_FETCH_ERROR_MESSAGE
        });
    });

    it('calls the service with undefined when the request has no user', async () => {
        const req = {} as unknown as Request;
        getMyAssignedCoursesServiceMock.mockResolvedValue({ success: true, courses: [] });

        await getMyAssignedCoursesController.getMyAssignedCourses(req, res);
        await flushMicrotasks();

        expect(getMyAssignedCoursesServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
    });
});