import updateMyModuleAcknowledgementService from '../../../services/common/updateMyModuleAcknowledgementService';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn(), updateOne: jest.fn(), findById: jest.fn() }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const assignmentUpdateOneMock = (CourseAssignment as unknown as { updateOne: jest.Mock }).updateOne;
const assignmentFindByIdMock = (CourseAssignment as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;

describe('updateMyModuleAcknowledgementService', () => {
    beforeEach(() => {
        assignmentFindOneMock.mockReset();
        assignmentUpdateOneMock.mockReset();
        assignmentFindByIdMock.mockReset();
        moduleFindByIdMock.mockReset();
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

    it('returns notFound when the assignment does not belong to the employee', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(null));

        const result = await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
            'assign1', 'module1', true, 'emp1'
        );

        expect(assignmentFindOneMock).toHaveBeenCalledWith({ _id: 'assign1', employeeId: 'emp1' });
        expect(result).toEqual({ success: false, notFound: true });
        expect(moduleFindByIdMock).not.toHaveBeenCalled();
    });

    it('returns invalidModule when the module does not exist', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        moduleFindByIdMock.mockReturnValue(leanMock(null));

        const result = await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
            'assign1', 'module1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, invalidModule: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('returns invalidModule when the module belongs to another course', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module9', courseId: 'other-course' }));

        const result = await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
            'assign1', 'module1', true, 'emp1'
        );

        expect(result).toEqual({ success: false, invalidModule: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('rejects revocation with acknowledged: false and writes nothing', async () => {
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));

        const result = await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
            'assign1', 'module1', false, 'emp1'
        );

        expect(result).toEqual({ success: false, revocationNotAllowed: true });
        expect(assignmentUpdateOneMock).not.toHaveBeenCalled();
    });

    it('saves a new acknowledgement against the employee, assignment and module', async () => {
        const savedAt = new Date('2026-10-12T07:30:00.000Z');
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));
        assignmentUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });
        assignmentFindByIdMock.mockReturnValue(leanMock({
            _id: 'assign1',
            moduleAcknowledgements: [{ moduleId: 'module1', acknowledged: true, acknowledgedAt: savedAt }]
        }));

        const result = await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
            'assign1', 'module1', true, 'emp1'
        );

        expect(assignmentUpdateOneMock).toHaveBeenCalledWith(
            { _id: 'assign1', employeeId: 'emp1', 'moduleAcknowledgements.moduleId': { $ne: 'module1' } },
            { $push: { moduleAcknowledgements: { moduleId: 'module1', acknowledged: true, acknowledgedAt: expect.any(Date) } } }
        );
        expect(assignmentFindByIdMock).toHaveBeenCalledWith('assign1');
        expect(result).toEqual({
            success: true,
            courseAssignmentId: 'assign1',
            moduleId: 'module1',
            acknowledged: true,
            acknowledgedAt: savedAt
        });
    });

    it('keeps the original acknowledgedAt on a retry and writes no duplicate', async () => {
        const originalTimestamp = new Date('2026-10-12T07:30:00.000Z');
        assignmentFindOneMock.mockReturnValue(leanMock(baseAssignment()));
        moduleFindByIdMock.mockReturnValue(leanMock({ _id: 'module1', courseId: 'course1' }));
        assignmentUpdateOneMock.mockResolvedValue({ modifiedCount: 0 });
        assignmentFindByIdMock.mockReturnValue(leanMock({
            _id: 'assign1',
            moduleAcknowledgements: [{ moduleId: 'module1', acknowledged: true, acknowledgedAt: originalTimestamp }]
        }));

        const result = await updateMyModuleAcknowledgementService.updateMyModuleAcknowledgement(
            'assign1', 'module1', true, 'emp1'
        );

        expect(assignmentUpdateOneMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            success: true,
            courseAssignmentId: 'assign1',
            moduleId: 'module1',
            acknowledged: true,
            acknowledgedAt: originalTimestamp
        });
    });
});