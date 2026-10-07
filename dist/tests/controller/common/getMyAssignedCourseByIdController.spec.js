"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyAssignedCourseByIdController_1 = __importDefault(require("../../../controllers/common/getMyAssignedCourseByIdController"));
const getMyAssignedCourseByIdService_1 = __importDefault(require("../../../services/common/getMyAssignedCourseByIdService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../../constants/common/myCoursesMessages");
jest.mock('../../../services/common/getMyAssignedCourseByIdService', () => ({
    __esModule: true,
    default: { getMyAssignedCourseById: jest.fn() }
}));
const getMyAssignedCourseByIdServiceMock = getMyAssignedCourseByIdService_1.default.getMyAssignedCourseById;
describe('getMyAssignedCourseByIdController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getMyAssignedCourseByIdServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the course detail on success', async () => {
        const req = {
            params: { courseAssignmentId: 'assign1' },
            user: { userId: 'emp1' }
        };
        const courseResponse = { success: true, course: { courseAssignmentId: 'assign1' } };
        getMyAssignedCourseByIdServiceMock.mockResolvedValue(courseResponse);
        await getMyAssignedCourseByIdController_1.default.getMyAssignedCourseById(req, res);
        expect(getMyAssignedCourseByIdServiceMock).toHaveBeenCalledWith('assign1', 'emp1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(courseResponse);
    });
    it('returns 404 when the service reports the course is not found', async () => {
        const req = {
            params: { courseAssignmentId: 'assign1' },
            user: { userId: 'emp1' }
        };
        getMyAssignedCourseByIdServiceMock.mockResolvedValue({ success: false });
        await getMyAssignedCourseByIdController_1.default.getMyAssignedCourseById(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            params: { courseAssignmentId: 'assign1' },
            user: { userId: 'emp1' }
        };
        getMyAssignedCourseByIdServiceMock.mockRejectedValue(new Error('boom'));
        await getMyAssignedCourseByIdController_1.default.getMyAssignedCourseById(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_FETCH_ERROR_MESSAGE
        });
    });
    it('calls the service with undefined when the request has no user', async () => {
        const req = { params: { courseAssignmentId: 'assign1' } };
        getMyAssignedCourseByIdServiceMock.mockResolvedValue({ success: true });
        await getMyAssignedCourseByIdController_1.default.getMyAssignedCourseById(req, res);
        expect(getMyAssignedCourseByIdServiceMock).toHaveBeenCalledWith('assign1', undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
});
