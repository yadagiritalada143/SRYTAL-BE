import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../../model/codingTaskTestCaseModel';
import getCourseTaskTestCasesService from '../../../services/common/getCourseTaskTestCasesService';

jest.mock('../../../model/courseAssignmentModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));
jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
jest.mock('../../../model/codingTaskTestCaseModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

const taskId = '66d323456789abcdef123456';
const userId = '65f1a2b3c4d5e6f7890abcd2';
const testCases = [{
    id: 'TC001',
    name: 'Basic case',
    input: '3',
    expectedOutput: '9',
    category: 'basic' as const
}];

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneMock =
    (CodingTaskTestCaseModel as unknown as { findOne: jest.Mock }).findOne;

const setAssignmentLookups = (): void => {
    taskFindByIdMock.mockReturnValue({
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: taskId,
                moduleId: '66d323456789abcdef123457',
                type: 'CODE'
            })
        })
    });
    moduleFindByIdMock.mockReturnValue({
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                courseId: '66d323456789abcdef123458'
            })
        })
    });
    assignmentFindOneMock.mockReturnValue({
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ _id: 'assignment-1' })
        })
    });
};

describe('getCourseTaskTestCasesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setAssignmentLookups();
        testCaseFindOneMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    taskId,
                    status: 'COMPLETED',
                    testCases
                })
            })
        });
    });

    it('returns the stored cases associated with the requested task only', async () => {
        const result = await getCourseTaskTestCasesService.getCourseTaskTestCases(
            taskId,
            userId
        );

        expect(testCaseFindOneMock).toHaveBeenCalledWith({ taskId });
        expect(result).toEqual({
            codingTaskId: taskId,
            testCases
        });
    });

    it('indicates generation is required when no completed test cases exist', async () => {
        testCaseFindOneMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })
        });

        await expect(
            getCourseTaskTestCasesService.getCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('TEST_CASES_NOT_GENERATED');
    });

    it('reports when test-case generation is still in progress', async () => {
        testCaseFindOneMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    taskId,
                    status: 'GENERATING',
                    testCases: []
                })
            })
        });

        await expect(
            getCourseTaskTestCasesService.getCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('TEST_CASES_GENERATION_IN_PROGRESS');
    });

    it('rejects retrieval for a task that is not a coding task', async () => {
        taskFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({
                    _id: taskId,
                    moduleId: '66d323456789abcdef123457',
                    type: 'FILE'
                })
            })
        });

        await expect(
            getCourseTaskTestCasesService.getCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('NOT_CODING_TASK');
        expect(testCaseFindOneMock).not.toHaveBeenCalled();
    });
});
