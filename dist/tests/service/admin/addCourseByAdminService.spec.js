"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCourseByAdminService_1 = __importDefault(require("../../../services/admin/addCourseByAdminService"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: jest.fn()
}));
const CourseModelMock = coursesModel_1.default;
describe('addCourseByAdminService', () => {
    let saveSpy;
    beforeEach(() => {
        CourseModelMock.mockReset();
        saveSpy = jest.fn();
        CourseModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('saves the course and returns the saved document', async () => {
        const savedCourse = { _id: 'c1', courseName: 'React', courseDescription: 'Frontend' };
        saveSpy.mockResolvedValue(savedCourse);
        const result = await addCourseByAdminService_1.default.addCourseByAdmin('React', 'Frontend');
        expect(CourseModelMock).toHaveBeenCalledTimes(1);
        expect(CourseModelMock).toHaveBeenCalledWith({ courseName: 'React', courseDescription: 'Frontend' });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(savedCourse);
    });
    it('returns { success: false } when saving throws', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));
        const result = await addCourseByAdminService_1.default.addCourseByAdmin('React', 'Frontend');
        expect(CourseModelMock).toHaveBeenCalledTimes(1);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ success: false });
    });
});
