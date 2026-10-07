"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseAssignmentDueDateController_1 = __importDefault(require("../../../controllers/admin/updateCourseAssignmentDueDateController"));
const updateCourseAssignmentDueDateService_1 = __importDefault(require("../../../services/admin/updateCourseAssignmentDueDateService"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/updateCourseAssignmentDueDateService', () => ({
    __esModule: true,
    default: {
        updateCourseAssignmentDueDate: jest.fn()
    }
}));
const updateCourseAssignmentDueDateServiceMock = updateCourseAssignmentDueDateService_1.default.updateCourseAssignmentDueDate;
describe('updateCourseAssignmentDueDate controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateCourseAssignmentDueDateServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 400 when the assignment id or due date is missing', async () => {
        const req = { params: { courseAssignmentId: 'a1' }, body: {} };
        await updateCourseAssignmentDueDateController_1.default.updateCourseAssignmentDueDate(req, res);
        expect(updateCourseAssignmentDueDateServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'courseAssignmentId and dueDate are required !'
        });
    });
    it('returns 200 with the updated assignment when the service resolves', async () => {
        const req = {
            params: { courseAssignmentId: 'a1' },
            body: { dueDate: new Date('2026-12-01') }
        };
        const updated = { _id: 'a1', dueDate: new Date('2026-12-01') };
        updateCourseAssignmentDueDateServiceMock.mockResolvedValue(updated);
        await updateCourseAssignmentDueDateController_1.default.updateCourseAssignmentDueDate(req, res);
        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledTimes(1);
        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledWith('a1', expect.any(Date));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: 'Course assignment due date updated successfully !',
            data: updated
        });
    });
    it('returns 404 when the service reports the assignment was not found', async () => {
        const req = {
            params: { courseAssignmentId: 'a9' },
            body: { dueDate: new Date('2026-12-01') }
        };
        updateCourseAssignmentDueDateServiceMock.mockRejectedValue(new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE));
        await updateCourseAssignmentDueDateController_1.default.updateCourseAssignmentDueDate(req, res);
        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_DETAILS_NOT_FOUND_MESSAGE
        });
    });
    it('returns 400 for any other service error', async () => {
        const req = {
            params: { courseAssignmentId: 'a1' },
            body: { dueDate: new Date('2026-12-01') }
        };
        updateCourseAssignmentDueDateServiceMock.mockRejectedValue(new Error('Unexpected failure'));
        await updateCourseAssignmentDueDateController_1.default.updateCourseAssignmentDueDate(req, res);
        expect(updateCourseAssignmentDueDateServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: 'Error occurred while updating course assignment due date !'
        });
    });
});
