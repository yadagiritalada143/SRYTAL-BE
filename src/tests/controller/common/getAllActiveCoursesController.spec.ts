import { Request, Response } from 'express';
import getAllActiveCoursesController from '../../../controllers/contentwriter/getAllActiveCoursesController';
import getAllActiveCoursesService from '../../../services/contentwriter/getAllActiveCoursesService';
import { COURSE_ERROR_MESSAGES, COURSE_SUCCESS_MESSAGES } from '../../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/getAllActiveCoursesService', () => ({
    __esModule: true,
    default: { AllActiveCourses: jest.fn() }
}));

const AllActiveCoursesMock = getAllActiveCoursesService.AllActiveCourses as unknown as jest.Mock;

describe('getAllActiveCoursesController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        AllActiveCoursesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the active courses and total count', async () => {
        const req = {} as unknown as Request;
        const data = {
            courses: [{ _id: 'c1', courseName: 'React', status: 'ACTIVE' }],
            totalActiveCourses: 1
        };
        AllActiveCoursesMock.mockResolvedValue(data);

        await getAllActiveCoursesController.getAllActiveCourses(req, res);

        expect(AllActiveCoursesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_SUCCESS_MESSAGES.ACTIVE_COURSES_FETCH__SUCCESS_MESSAGE,
            courses: data.courses,
            totalActiveCourses: data.totalActiveCourses
        });
    });

    it('returns 500 when the service rejects', async () => {
        const req = {} as unknown as Request;
        AllActiveCoursesMock.mockRejectedValue(new Error('Service failure'));

        await getAllActiveCoursesController.getAllActiveCourses(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE
        });
    });
});