import { Request, Response } from 'express';
import getCourseByIdController from '../../../controllers/contentwriter/getCourseByIdController';
import getCourseByIdService from '../../../services/contentwriter/getCourseByIdService';
import { COURSE_ERROR_MESSAGES } from '../../../constants/contentwriter/courseMessages';
import { HTTP_STATUS } from '../../../constants/commonErrorMessages';

jest.mock('../../../services/contentwriter/getCourseByIdService', () => ({
    __esModule: true,
    default: { getCourseById: jest.fn() }
}));

const getCourseByIdMock = getCourseByIdService.getCourseById as unknown as jest.Mock;

const flushMicrotasks = () => new Promise<void>(resolve => setImmediate(resolve));

describe('getCourseByIdController', () => {
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let res: Response;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson } as unknown as Response;
        getCourseByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns 200 with the course details', async () => {
        const req = { params: { id: 'c1' } } as unknown as Request;
        const courseResponse = { success: true, coursedata: { _id: 'c1', courseName: 'React' } };
        getCourseByIdMock.mockResolvedValue(courseResponse);

        getCourseByIdController.getCourseDetailsById(req, res);
        await flushMicrotasks();

        expect(getCourseByIdMock).toHaveBeenCalledWith('c1');
        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(courseResponse);
    });

    it('returns 500 when the service rejects', async () => {
        const req = { params: { id: 'c1' } } as unknown as Request;
        getCourseByIdMock.mockRejectedValue(new Error('Service failure'));

        getCourseByIdController.getCourseDetailsById(req, res);
        await flushMicrotasks();

        expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE
        });
    });
});