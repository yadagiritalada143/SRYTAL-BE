import { Request, Response } from 'express';
import getAllCoursesController from '../../../controllers/contentwriter/getAllCoursesController';
import getAllCoursesService from '../../../services/contentwriter/getAllCoursesService';
import { COURSE_ERROR_MESSAGES } from '../../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/getAllCoursesService', () => ({
    __esModule: true,
    default: { AllCourses: jest.fn() }
}));

const AllCoursesMock = getAllCoursesService.AllCourses as unknown as jest.Mock;

describe('getAllCoursesController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        AllCoursesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the courses and totals', async () => {
        const req = {} as unknown as Request;
        const data = {
            courses: [{ _id: 'c1', courseName: 'React' }],
            totals: { totalCourses: 1, totalModules: 2, totalTasks: 3 }
        };
        AllCoursesMock.mockResolvedValue(data);

        await getAllCoursesController.getAllCourses(req, res);

        expect(AllCoursesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            courses: data.courses,
            totals: data.totals
        });
    });

    it('returns 500 when the service rejects', async () => {
        const req = {} as unknown as Request;
        AllCoursesMock.mockRejectedValue(new Error('Service failure'));

        await getAllCoursesController.getAllCourses(req, res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE
        });
    });
});