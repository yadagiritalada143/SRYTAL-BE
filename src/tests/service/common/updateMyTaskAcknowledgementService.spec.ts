import updateMyTaskAcknowledgementService from '../../../services/common/updateMyTaskAcknowledgementService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn(), findById: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const assignmentUpdateOneMock = (CourseAssignment as unknown as { updateOne: jest.Mock }).updateOne;
const assignmentFindByIdMock = (CourseAssignment as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;

describe('updateMyTaskAcknowledgementService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        assignmentUpdateOneMock.mockReset();
        assignmentFindByIdMock.mockReset();
        moduleFindByIdMock.mockReset();
        taskFindByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const leanMock = (value: any) => ({ lean: jest.fn().mockResolvedValue(value) });

    const baseAssignment = () => ({
        _id: 'assign1',
        courseId: 'course1',
        employeeId: 'emp1'
    });

    const fileTask = () => ({ _id: 'task1', moduleId: 'module1', type: 'FILE' });

    it('returns notFound when the assignment does not belong to the employee', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(null));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(assignmentFindOneMock).toHaveBeenCalledWith({ _id: 'assign1', employeeId: 'emp1' });
        expect(result).toEqual({ success: false, notFound: true });
        expect(taskFindByIdMock).not.toHaveBeenCalled();
    });

    it('returns invalidTask when the task does not exist', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock(null));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, invalidTask: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('returns invalidTask when the parent module is missing', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock(fileTask()));
        moduleFindByIdMock.mockReturnValue(leanMock(null));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, invalidTask: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('returns invalidTask when the task belongs to another course', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock(fileTask()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module9', courseId: 'other-course' }));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, invalidTask: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('returns notFileTask when the task is not a FILE task', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock({ _id: 'task1', moduleId: 'module1', type: 'LINK' }));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, notFileTask: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('returns notFileTask for a CODE task', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock({ _id: 'task1', moduleId: 'module1', type: 'CODE' }));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, notFileTask: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('rejects revocation with acknowledged: false and writes nothing', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock(fileTask()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', false, 'emp1'
        );

        expect(result).toEqual({ success: false, revocationNotAllowed: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('saves a new acknowledgement against the employee, assignment and task', async () => {
        const savedAt = new Date('2026-10-12T07:30:00.000Z');
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock(fileTask()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));
        assignmentUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
        assignmentFindByIdMock.mockReturnValue(leanMock({
            _id: 'assign1',
            taskAcknowledgements: [{ taskId: 'task1', acknowledged: true, acknowledgedAt: savedAt }]
        }));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(assignmentUpdateOneMock).toHaveBeenCalledWith(
            { _id: 'assign1', employeeId: 'emp1', 'taskAcknowledgements.taskId': { $ne: 'task1' } },
            { $push: { taskAcknowledgements: { taskId: 'task1', acknowledged: true, acknowledgedAt: expect.any(Date) } } }
        );
        expect(assignmentFindByIdMock).toHaveBeenCalledWith('assign1');
        expect(result).toEqual({
            success: true,
            courseAssignmentId: 'assign1',
            taskId: 'task1',
            acknowledged: true,
            acknowledgedAt: savedAt
        });
    });

    it('keeps the original acknowledgedAt on a retry and writes no duplicate', async () => {
        const originalTimestamp = new Date('2026-10-12T07:30:00.000Z');
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        taskFindByIdMock.mockReturnValue(leanMock(fileTask()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));
        assignmentUpdateOneMock.mockResolvedValue({ modifiedCount: 0 });
        assignmentFindByIdMock.mockReturnValue(leanMock({
            _id: 'assign1',
            taskAcknowledgements: [{ taskId: 'task1', acknowledged: true, acknowledgedAt: originalTimestamp }]
        }));

        const result = await updateMyTaskAcknowledgementService.updateMyTaskAcknowledgement(
            'assign1', 'task1', true, 'emp1'
        );

        expect(assignmentUpdateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            success: true,
            courseAssignmentId: 'assign1',
            taskId: 'task1',
            acknowledged: true,
            acknowledgedAt: originalTimestamp
        });
    });
});