"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllCoursesController_1 = __importDefault(require("../../../controllers/contentwriter/getAllCoursesController"));
const getAllCoursesService_1 = __importDefault(require("../../../services/contentwriter/getAllCoursesService"));
const courseMessages_1 = require("../../../constants/contentwriter/courseMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/contentwriter/getAllCoursesService', () => ({
    __esModule: true,
    default: { AllCourses: jest.fn() }
}));
const AllCoursesMock = getAllCoursesService_1.default.AllCourses;
describe('getAllCoursesController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        AllCoursesMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the courses and totals', async () => {
        const req = {};
        const data = {
            courses: [{ _id: 'c1', courseName: 'React' }],
            totals: { totalCourses: 1, totalModules: 2, totalTasks: 3 }
        };
        AllCoursesMock.mockResolvedValue(data);
        await getAllCoursesController_1.default.getAllCourses(req, res);
        expect(AllCoursesMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            courses: data.courses,
            totals: data.totals
        });
    });
    it('returns 500 when the service rejects', async () => {
        const req = {};
        AllCoursesMock.mockRejectedValue(new Error('Service failure'));
        await getAllCoursesController_1.default.getAllCourses(req, res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_FETCH_ERROR_MESSAGE
        });
    });
});
