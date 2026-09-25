"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getMyAssignedCoursesController_1 = __importDefault(require("../../../controllers/common/getMyAssignedCoursesController"));
const getMyAssignedCoursesService_1 = __importDefault(require("../../../services/common/getMyAssignedCoursesService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../../constants/common/myCoursesMessages");
jest.mock('../../../services/common/getMyAssignedCoursesService', () => ({
    __esModule: true,
    default: { getMyAssignedCourses: jest.fn() }
}));
const getMyAssignedCoursesServiceMock = getMyAssignedCoursesService_1.default.getMyAssignedCourses;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getMyAssignedCoursesController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getMyAssignedCoursesServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the courses on success', async () => {
        const req = { user: { userId: 'emp1' } };
        const coursesResponse = { success: true, courses: [] };
        getMyAssignedCoursesServiceMock.mockResolvedValue(coursesResponse);
        await getMyAssignedCoursesController_1.default.getMyAssignedCourses(req, res);
        await flushMicrotasks();
        expect(getMyAssignedCoursesServiceMock).toHaveBeenCalledWith('emp1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(coursesResponse);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = { user: { userId: 'emp1' } };
        getMyAssignedCoursesServiceMock.mockRejectedValue(new Error('boom'));
        await getMyAssignedCoursesController_1.default.getMyAssignedCourses(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSES_FETCH_ERROR_MESSAGE
        });
    });
    it('calls the service with undefined when the request has no user', async () => {
        const req = {};
        getMyAssignedCoursesServiceMock.mockResolvedValue({ success: true, courses: [] });
        await getMyAssignedCoursesController_1.default.getMyAssignedCourses(req, res);
        await flushMicrotasks();
        expect(getMyAssignedCoursesServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
});
