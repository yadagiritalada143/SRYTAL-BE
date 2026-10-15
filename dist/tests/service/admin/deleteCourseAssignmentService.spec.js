"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deleteCourseAssignmentService_1 = __importDefault(require("../../../services/admin/deleteCourseAssignmentService"));
const courseAssignmentModel_1 = __importDefault(require("../../../model/courseAssignmentModel"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findByIdAndDelete: jest.fn() }
}));
const findByIdAndDeleteMock = courseAssignmentModel_1.default.findByIdAndDelete;
describe('deleteCourseAssignmentService', () => {
    beforeEach(() => {
        findByIdAndDeleteMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the deleted assignment when it exists', async () => {
        const deleted = { _id: 'a1', courseId: 'c1' };
        findByIdAndDeleteMock.mockResolvedValue(deleted);
        const result = await deleteCourseAssignmentService_1.default.deleteCourseAssignment('a1');
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndDeleteMock).toHaveBeenCalledWith('a1');
        expect(result).toEqual(deleted);
    });
    it('rejects with the invalid id message when no id is provided', async () => {
        await expect(deleteCourseAssignmentService_1.default.deleteCourseAssignment('')).rejects.toThrow(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ID_INVALID_MESSAGE);
        expect(findByIdAndDeleteMock).not.toHaveBeenCalled();
    });
    it('rejects with the not found message when the assignment does not exist', async () => {
        findByIdAndDeleteMock.mockResolvedValue(null);
        await expect(deleteCourseAssignmentService_1.default.deleteCourseAssignment('a9')).rejects.toThrow(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE);
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
    });
    it('propagates database errors', async () => {
        const dbError = new Error('Database failure');
        findByIdAndDeleteMock.mockRejectedValue(dbError);
        await expect(deleteCourseAssignmentService_1.default.deleteCourseAssignment('a1')).rejects.toThrow(dbError);
        expect(findByIdAndDeleteMock).toHaveBeenCalledTimes(1);
    });
});
