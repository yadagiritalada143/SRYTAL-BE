"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllCourseAssignmentsController_1 = __importDefault(require("../../../controllers/admin/getAllCourseAssignmentsController"));
const getAllCourseAssignmentsService_1 = __importDefault(require("../../../services/admin/getAllCourseAssignmentsService"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getAllCourseAssignmentsService', () => ({
    __esModule: true,
    default: {
        getAllCourseAssignments: jest.fn()
    }
}));
const getAllCourseAssignmentsServiceMock = getAllCourseAssignmentsService_1.default.getAllCourseAssignments;
describe('getAllCourseAssignments controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAllCourseAssignmentsServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the fetched assignments and pagination', async () => {
        const req = {
            query: { employeeId: 'e1', employeeName: 'John', page: '2', limit: '5' }
        };
        const result = { data: [{ _id: 'a1' }], pagination: { page: 2, limit: 5, total: 1, totalPages: 1 } };
        getAllCourseAssignmentsServiceMock.mockResolvedValue(result);
        await getAllCourseAssignmentsController_1.default.getAllCourseAssignments(req, res);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledTimes(1);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledWith({
            employeeId: 'e1',
            employeeName: 'John',
            page: 2,
            limit: 5
        });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_FETCH_SUCCESS_MESSAGE,
            data: result.data,
            pagination: result.pagination
        });
    });
    it('passes undefined for non-string and empty page/limit values', async () => {
        const req = {
            query: { employeeId: ['e1'], employeeName: '', page: '', limit: undefined }
        };
        getAllCourseAssignmentsServiceMock.mockResolvedValue({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
        await getAllCourseAssignmentsController_1.default.getAllCourseAssignments(req, res);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledTimes(1);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledWith({
            employeeId: undefined,
            employeeName: '',
            page: undefined,
            limit: undefined
        });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { query: {} };
        getAllCourseAssignmentsServiceMock.mockRejectedValue(new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE));
        await getAllCourseAssignmentsController_1.default.getAllCourseAssignments(req, res);
        expect(getAllCourseAssignmentsServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_FETCH_ERROR_MESSAGE
        });
    });
});
