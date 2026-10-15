import { Request, Response } from 'express';
import cloneCourseController from '../../../controllers/contentwriter/cloneCourseController';
import cloneCourseService from '../../../services/contentwriter/cloneCourseService';
import {
    COURSE_CLONE_ERROR_CODES,
    COURSE_ERROR_MESSAGES,
    COURSE_SUCCESS_MESSAGES
} from '../../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/cloneCourseService', () => ({
    __esModule: true,
    default: { cloneCourse: jest.fn() }
}));

const cloneCourseMock = cloneCourseService.cloneCourse as jest.Mock;

const buildReq = (body: any): Request => ({ body } as unknown as Request);

describe('cloneCourseController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        cloneCourseMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const requestBody = {
        courseId: 'src-course',
        courseName: 'JavaScript Advanced',
        modules: [{ moduleId: 'mod-1', taskIds: ['task-1'] }]
    };

    it('returns 201 with the cloned course data', async () => {
        const data = {
            courseId: 'new-course',
            courseName: 'JavaScript Advanced',
            status: 'ACTIVE',
            modules: []
        };
        cloneCourseMock.mockResolvedValue({ success: true, data });

        await cloneCourseController.cloneCourse(buildReq(requestBody), res);

        expect(cloneCourseMock).toHaveBeenCalledWith({
            courseId: 'src-course',
            courseName: 'JavaScript Advanced',
            modules: [{ moduleId: 'mod-1', taskIds: ['task-1'] }]
        });
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_SUCCESS_MESSAGES.COURSE_CLONE_SUCCESS_MESSAGE,
            data
        });
    });

    it('returns 404 when the source course is not found', async () => {
        cloneCourseMock.mockResolvedValue({
            success: false,
            code: COURSE_CLONE_ERROR_CODES.SOURCE_NOT_FOUND,
            message: COURSE_ERROR_MESSAGES.COURSE_CLONE_SOURCE_NOT_FOUND_MESSAGE
        });

        await cloneCourseController.cloneCourse(buildReq(requestBody), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_CLONE_SOURCE_NOT_FOUND_MESSAGE
        });
    });

    it.each([
        COURSE_CLONE_ERROR_CODES.SOURCE_NOT_ARCHIVED,
        COURSE_CLONE_ERROR_CODES.INVALID_MODULE,
        COURSE_CLONE_ERROR_CODES.INVALID_TASK
    ])('returns 400 for the %s validation failure', async (code) => {
        cloneCourseMock.mockResolvedValue({
            success: false,
            code,
            message: 'invalid selection'
        });

        await cloneCourseController.cloneCourse(buildReq(requestBody), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'invalid selection'
        });
    });

    it('returns 500 when cloning fails unexpectedly', async () => {
        cloneCourseMock.mockResolvedValue({
            success: false,
            code: COURSE_CLONE_ERROR_CODES.CLONE_FAILED
        });

        await cloneCourseController.cloneCourse(buildReq(requestBody), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
        });
    });

    it('returns 500 when the service throws', async () => {
        cloneCourseMock.mockRejectedValue(new Error('Service failure'));

        await cloneCourseController.cloneCourse(buildReq(requestBody), res);

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_CLONE_ERROR_MESSAGE
        });
    });
});
