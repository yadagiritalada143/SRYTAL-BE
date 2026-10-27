import { Request, Response } from 'express';
import getCourseAssignmentDetailsController from '../../../controllers/admin/getCourseAssignmentDetailsController';
import getAdminCourseAssignmentDetailsService from '../../../services/admin/getAdminCourseAssignmentDetailsService';
import {
    COURSE_ASSIGNMENT_SUCCESS_MESSAGES,
    COURSE_ASSIGNMENT_ERRORS_MESSAGES
} from '../../../constants/admin/courseAssignmentMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/admin/getAdminCourseAssignmentDetailsService', () => ({
    __esModule: true,
    default: {
        getAdminCourseAssignmentDetails: jest.fn()
    }
}));

const getAdminCourseAssignmentDetailsServiceMock =
    getAdminCourseAssignmentDetailsService.getAdminCourseAssignmentDetails as unknown as jest.Mock;

describe('getCourseAssignmentDetails controller', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getAdminCourseAssignmentDetailsServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 400 when the assignment id is missing', async () => {
        const req = { params: {} } as unknown as Request;

        await getCourseAssignmentDetailsController.getCourseAssignmentDetails(req, res);

        expect(getAdminCourseAssignmentDetailsServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
        });
    });

    it('returns 404 when the service reports the assignment was not found', async () => {
        const req = { params: { courseAssignmentId: 'a9' } } as unknown as Request;
        getAdminCourseAssignmentDetailsServiceMock.mockResolvedValue({ success: false });

        await getCourseAssignmentDetailsController.getCourseAssignmentDetails(req, res);

        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledTimes(1);
        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledWith('a9');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
        });
    });

    it('returns 200 with the details when the service resolves', async () => {
        const req = { params: { courseAssignmentId: 'a1' } } as unknown as Request;
        const response = { success: true, course: { _id: 'c1' } };
        getAdminCourseAssignmentDetailsServiceMock.mockResolvedValue(response);

        await getCourseAssignmentDetailsController.getCourseAssignmentDetails(req, res);

        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_SUCCESS_MESSAGE,
            data: response
        });
    });

    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { courseAssignmentId: 'a1' } } as unknown as Request;
        getAdminCourseAssignmentDetailsServiceMock.mockRejectedValue(new Error('Service failure'));

        await getCourseAssignmentDetailsController.getCourseAssignmentDetails(req, res);

        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});