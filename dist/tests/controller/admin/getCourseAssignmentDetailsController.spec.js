"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseAssignmentDetailsController_1 = __importDefault(require("../../../controllers/admin/getCourseAssignmentDetailsController"));
const getAdminCourseAssignmentDetailsService_1 = __importDefault(require("../../../services/admin/getAdminCourseAssignmentDetailsService"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/getAdminCourseAssignmentDetailsService', () => ({
    __esModule: true,
    default: {
        getAdminCourseAssignmentDetails: jest.fn()
    }
}));
const getAdminCourseAssignmentDetailsServiceMock = getAdminCourseAssignmentDetailsService_1.default.getAdminCourseAssignmentDetails;
describe('getCourseAssignmentDetails controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getAdminCourseAssignmentDetailsServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 400 when the assignment id is missing', async () => {
        const req = { params: {} };
        await getCourseAssignmentDetailsController_1.default.getCourseAssignmentDetails(req, res);
        expect(getAdminCourseAssignmentDetailsServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
        });
    });
    it('returns 404 when the service reports the assignment was not found', async () => {
        const req = { params: { courseAssignmentId: 'a9' } };
        getAdminCourseAssignmentDetailsServiceMock.mockResolvedValue({ success: false });
        await getCourseAssignmentDetailsController_1.default.getCourseAssignmentDetails(req, res);
        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledTimes(1);
        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledWith('a9');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
        });
    });
    it('returns 200 with the details when the service resolves', async () => {
        const req = { params: { courseAssignmentId: 'a1' } };
        const response = { success: true, course: { _id: 'c1' } };
        getAdminCourseAssignmentDetailsServiceMock.mockResolvedValue(response);
        await getCourseAssignmentDetailsController_1.default.getCourseAssignmentDetails(req, res);
        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_SUCCESS_MESSAGE,
            data: response
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { params: { courseAssignmentId: 'a1' } };
        getAdminCourseAssignmentDetailsServiceMock.mockRejectedValue(new Error('Service failure'));
        await getCourseAssignmentDetailsController_1.default.getCourseAssignmentDetails(req, res);
        expect(getAdminCourseAssignmentDetailsServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_FETCH_ERROR_MESSAGE
        });
    });
});
