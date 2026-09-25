"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createCourseAssignmentController_1 = __importDefault(require("../../../controllers/admin/createCourseAssignmentController"));
const createCourseAssignmentService_1 = __importDefault(require("../../../services/admin/createCourseAssignmentService"));
const courseAssignmentMessages_1 = require("../../../constants/admin/courseAssignmentMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/createCourseAssignmentService', () => ({
    __esModule: true,
    default: {
        createCourseAssignment: jest.fn()
    }
}));
const createCourseAssignmentServiceMock = createCourseAssignmentService_1.default.createCourseAssignment;
describe('createCourseAssignment controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        createCourseAssignmentServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 400 when a required field is missing', async () => {
        const req = { body: { courseId: 'c1', employeeId: 'e1' } };
        await createCourseAssignmentController_1.default.createCourseAssignment(req, res);
        expect(createCourseAssignmentServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_MISSING_FIELDS_MESSAGE
        });
    });
    it('returns 201 with the created assignment when the service resolves', async () => {
        const req = {
            body: { courseId: 'c1', employeeId: 'e1', dueDate: new Date('2026-12-01') },
            user: { userId: 'u-admin' }
        };
        const created = { _id: 'a1' };
        createCourseAssignmentServiceMock.mockResolvedValue(created);
        await createCourseAssignmentController_1.default.createCourseAssignment(req, res);
        expect(createCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(createCourseAssignmentServiceMock).toHaveBeenCalledWith('c1', 'e1', 'u-admin', expect.any(Date));
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_SUCCESS_MESSAGES.COURSE_ASSIGNMENT_CREATE_SUCCESS_MESSAGE,
            data: created
        });
    });
    it('returns 409 when the course is already assigned to the employee', async () => {
        const req = {
            body: { courseId: 'c1', employeeId: 'e1', dueDate: new Date('2026-12-01') },
            user: { userId: 'u-admin' }
        };
        createCourseAssignmentServiceMock.mockRejectedValue(new Error(courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE));
        await createCourseAssignmentController_1.default.createCourseAssignment(req, res);
        expect(createCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CONFLICT);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE
        });
    });
    it('returns 400 with the create error for any other service error', async () => {
        const req = {
            body: { courseId: 'c1', employeeId: 'e1', dueDate: new Date('2026-12-01') },
            user: { userId: 'u-admin' }
        };
        createCourseAssignmentServiceMock.mockRejectedValue(new Error('Unexpected failure'));
        await createCourseAssignmentController_1.default.createCourseAssignment(req, res);
        expect(createCourseAssignmentServiceMock).toHaveBeenCalledTimes(1);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseAssignmentMessages_1.COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_CREATE_ERROR_MESSAGE
        });
    });
});
