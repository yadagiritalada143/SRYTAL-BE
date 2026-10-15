"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateMyTaskProgressController_1 = __importDefault(require("../../../controllers/common/updateMyTaskProgressController"));
const updateMyTaskProgressService_1 = __importDefault(require("../../../services/common/updateMyTaskProgressService"));
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
const myCoursesMessages_1 = require("../../../constants/common/myCoursesMessages");
jest.mock('../../../services/common/updateMyTaskProgressService', () => ({
    __esModule: true,
    default: { updateMyTaskProgress: jest.fn() }
}));
const updateMyTaskProgressServiceMock = updateMyTaskProgressService_1.default.updateMyTaskProgress;
describe('updateMyTaskProgressController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        updateMyTaskProgressServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    const buildReq = (body) => ({ body, user: { userId: 'emp1' } });
    it.each([
        [{}],
        [{ courseAssignmentId: 'assign1' }],
        [{ courseAssignmentId: 'assign1', taskId: 'task1' }],
        [{ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: 'yes' }]
    ])('returns 400 when required fields are missing or invalid', async (body) => {
        await updateMyTaskProgressController_1.default.updateMyTaskProgress(buildReq(body), res);
        expect(updateMyTaskProgressServiceMock).not.toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_MISSING_FIELDS_MESSAGE
        });
    });
    it('returns 404 when the assignment is not found', async () => {
        updateMyTaskProgressServiceMock.mockResolvedValue({ success: false, notFound: true });
        await updateMyTaskProgressController_1.default.updateMyTaskProgress(buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }), res);
        expect(updateMyTaskProgressServiceMock).toHaveBeenCalledWith('assign1', 'task1', true, 'emp1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.NOT_FOUND);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.MY_COURSE_NOT_FOUND_MESSAGE
        });
    });
    it('returns 400 when the task is not part of the course', async () => {
        updateMyTaskProgressServiceMock.mockResolvedValue({ success: false, invalidTask: true });
        await updateMyTaskProgressController_1.default.updateMyTaskProgress(buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_NOT_IN_COURSE_MESSAGE
        });
    });
    it('returns 200 with the progress response on success', async () => {
        const progressResponse = {
            success: true,
            courseStatus: 'In Progress',
            progress: { totalTasks: 1, completedTasks: 1, percentComplete: 100 },
            task: { taskId: 'task1', isCompleted: true, completedAt: new Date('2026-07-08') }
        };
        updateMyTaskProgressServiceMock.mockResolvedValue(progressResponse);
        await updateMyTaskProgressController_1.default.updateMyTaskProgress(buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(Object.assign(Object.assign({}, progressResponse), { message: myCoursesMessages_1.MY_COURSES_SUCCESS_MESSAGES.TASK_PROGRESS_UPDATE_SUCCESS_MESSAGE }));
    });
    it('returns 500 when the service throws', async () => {
        updateMyTaskProgressServiceMock.mockRejectedValue(new Error('boom'));
        await updateMyTaskProgressController_1.default.updateMyTaskProgress(buildReq({ courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }), res);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: myCoursesMessages_1.MY_COURSES_ERROR_MESSAGES.TASK_PROGRESS_UPDATE_ERROR_MESSAGE
        });
    });
    it('calls the service with undefined when the request has no user', async () => {
        const req = {
            body: { courseAssignmentId: 'assign1', taskId: 'task1', isCompleted: true }
        };
        updateMyTaskProgressServiceMock.mockResolvedValue({ success: true });
        await updateMyTaskProgressController_1.default.updateMyTaskProgress(req, res);
        expect(updateMyTaskProgressServiceMock).toHaveBeenCalledWith('assign1', 'task1', true, undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
});
