import axios from 'axios';
import { createHash } from 'crypto';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../../model/codingTaskTestCaseModel';
import generateCourseTaskTestCasesService from '../../../services/common/generateCourseTaskTestCasesService';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        isAxiosError: jest.fn((error: unknown) =>
            Boolean(error && typeof error === 'object' && 'isAxiosError' in error)
        )
    }
}));
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
    default: {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn()
    }
}));
jest.mock('../../../services/useropenrouter/getUserOpenRouterKeyService', () => ({
    __esModule: true,
    default: { getUserOpenRouterKeyService: jest.fn() }
}));

const taskId = '66d323456789abcdef123456';
const userId = '65f1a2b3c4d5e6f7890abcd2';
const taskName = 'Square a number';
const taskDescription = 'Read an integer and output its square.';
const taskDescriptionHash = createHash('sha256')
    .update(taskDescription)
    .digest('hex');
const savedKey = 'sk-or-saved-secret';
const testCases = Array.from({ length: 4 }, (_, index) => ({
    id: `TC${String(index + 1).padStart(3, '0')}`,
    name: `Input ${index + 1}`,
    input: String(index + 1),
    expectedOutput: String((index + 1) ** 2),
    category: index === 0 ? 'basic' : 'edge'
}));
const openRouterContent = JSON.stringify({ testCases });

const taskFindByIdMock =
    (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock =
    (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const assignmentFindOneMock =
    (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneMock =
    (CodingTaskTestCaseModel as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneAndUpdateMock =
    (CodingTaskTestCaseModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const testCaseCreateMock =
    (CodingTaskTestCaseModel as unknown as { create: jest.Mock }).create;
const testCaseUpdateOneMock =
    (CodingTaskTestCaseModel as unknown as { updateOne: jest.Mock }).updateOne;
const axiosPostMock = axios.post as jest.Mock;
const getKeyMock =
    getUserOpenRouterKeyService.getUserOpenRouterKeyService as jest.Mock;

const setExistingSet = (result: unknown): void => {
    testCaseFindOneMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue(result)
    });
};

describe('generateCourseTaskTestCasesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        taskFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: taskId,
                type: 'CODE',
                taskName,
                taskDescription,
                moduleId: '66d323456789abcdef123457'
            })
        });
        moduleFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ courseId: '66d323456789abcdef123458' })
            })
        });
        assignmentFindOneMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue({ _id: 'assignment-1' })
            })
        });
        setExistingSet(null);
        testCaseCreateMock.mockResolvedValue({});
        testCaseUpdateOneMock.mockResolvedValue({ matchedCount: 1 });
        getKeyMock.mockResolvedValue({ openrouterKey: savedKey });
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: openRouterContent } }] }
        });
    });

    it('uses the task description and saved per-user key, validates, and stores cases', async () => {
        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(getKeyMock).toHaveBeenCalledWith(userId);
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        const prompt = axiosPostMock.mock.calls[0][1].messages[1].content;
        expect(prompt).toContain(taskDescription);
        expect(axiosPostMock.mock.calls[0][2].headers.Authorization)
            .toBe(`Bearer ${savedKey}`);
        expect(prompt).toContain(taskName);
        expect(JSON.stringify(result)).not.toContain(savedKey);
        expect(testCaseCreateMock).toHaveBeenCalledWith(expect.objectContaining({
            taskId,
            taskDescriptionHash,
            status: 'GENERATING'
        }));
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, taskDescriptionHash, status: 'GENERATING' },
            {
                $set: expect.objectContaining({
                    status: 'COMPLETED',
                    taskDescriptionHash,
                    testCases
                })
            }
        );
        expect(result).toMatchObject({
            taskId,
            generated: true,
            reused: false,
            testCaseCount: 4
        });
    });

    it('reuses valid test cases for an unchanged task without another OpenRouter request', async () => {
        setExistingSet({
            status: 'COMPLETED',
            testCases,
            taskDescriptionHash
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(result).toMatchObject({ generated: false, reused: true, testCaseCount: 4 });
        expect(getKeyMock).not.toHaveBeenCalled();
        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(testCaseCreateMock).not.toHaveBeenCalled();
    });

    it('regenerates when forceRegenerate is true', async () => {
        setExistingSet({
            _id: 'case-set-id',
            status: 'COMPLETED',
            testCases,
            taskDescriptionHash
        });
        testCaseFindOneAndUpdateMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ status: 'GENERATING' })
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId,
                true
            );

        expect(testCaseFindOneAndUpdateMock).toHaveBeenCalled();
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject({ generated: true, reused: false });
    });

    it('regenerates when the coding task description changes', async () => {
        const changedDescription = `${taskDescription} Return the result as an integer.`;
        const changedHash = createHash('sha256').update(changedDescription).digest('hex');
        taskFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: taskId,
                type: 'CODE',
                taskName,
                taskDescription: changedDescription,
                moduleId: '66d323456789abcdef123457'
            })
        });
        setExistingSet({
            _id: 'case-set-id',
            status: 'COMPLETED',
            testCases,
            taskDescriptionHash
        });
        testCaseFindOneAndUpdateMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ status: 'GENERATING' })
        });

        await generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId);

        expect(axiosPostMock.mock.calls[0][1].messages[1].content)
            .toContain(changedDescription);
        expect(testCaseFindOneAndUpdateMock.mock.calls[0][0]).toEqual(
            expect.objectContaining({ taskId, status: 'COMPLETED' })
        );
        expect(testCaseFindOneAndUpdateMock.mock.calls[0][1].$set)
            .toEqual(expect.objectContaining({ taskDescriptionHash: changedHash }));
    });

    it('rejects a missing task description before calling OpenRouter', async () => {
        taskFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: taskId,
                type: 'CODE',
                taskName,
                taskDescription: ' ',
                moduleId: '66d323456789abcdef123457'
            })
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('CODING_TASK_DESCRIPTION_REQUIRED');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('rejects a missing task name before calling OpenRouter', async () => {
        taskFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: taskId,
                type: 'CODE',
                taskName: ' ',
                taskDescription,
                moduleId: '66d323456789abcdef123457'
            })
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('CODING_TASK_NAME_REQUIRED');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it.each([
        ['malformed JSON', '{"testCases": ['],
        ['blank expected output', JSON.stringify({
            testCases: testCases.map((testCase, index) => ({
                ...testCase,
                expectedOutput: index === 0 ? '' : testCase.expectedOutput
            }))
        })]
    ])('rejects %s and marks generation failed', async (_caseName, responseContent) => {
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: responseContent } }] }
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('INVALID_GENERATED_TEST_CASES');
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, taskDescriptionHash, status: 'GENERATING' },
            { $set: { status: 'FAILED' } }
        );
    });

    it('surfaces an invalid OpenRouter key and marks generation failed', async () => {
        const error = Object.assign(new Error('Unauthorized'), {
            isAxiosError: true,
            response: { status: 401 }
        });
        axiosPostMock.mockRejectedValueOnce(error);

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('OPENROUTER_KEY_INVALID');
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, taskDescriptionHash, status: 'GENERATING' },
            { $set: { status: 'FAILED' } }
        );
    });

    it('rejects blank expected output during validation', () => {
        const invalid = testCases.map((testCase, index) => ({
            ...testCase,
            expectedOutput: index === 0 ? '  ' : testCase.expectedOutput
        }));

        expect(() =>
            generateCourseTaskTestCasesService.parseGeneratedTestCases(
                JSON.stringify({ testCases: invalid })
            )
        ).toThrow('INVALID_GENERATED_TEST_CASES');
    });

    it('rejects a concurrent generation when the unique lock row already exists', async () => {
        setExistingSet(null);
        testCaseCreateMock.mockRejectedValueOnce(
            Object.assign(new Error('E11000 duplicate key'), { code: 11000 })
        );

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('TEST_CASES_GENERATION_IN_PROGRESS');

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(testCaseUpdateOneMock).not.toHaveBeenCalled();
    });

    it('rejects while a fresh generation lock is still held', async () => {
        setExistingSet({
            status: 'GENERATING',
            updatedAt: new Date(),
            testCases: []
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('TEST_CASES_GENERATION_IN_PROGRESS');

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(testCaseFindOneAndUpdateMock).not.toHaveBeenCalled();
    });

    it('reclaims a stale generation lock and generates new cases', async () => {
        setExistingSet({
            _id: 'case-set-id',
            status: 'GENERATING',
            updatedAt: new Date(Date.now() - 5 * 60 * 1000),
            testCases: [],
            taskDescriptionHash
        });
        testCaseFindOneAndUpdateMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ status: 'GENERATING' })
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(result).toMatchObject({ generated: true, reused: false, testCaseCount: 4 });
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        const [claimFilter] = testCaseFindOneAndUpdateMock.mock.calls[0];
        expect(claimFilter).toEqual(
            expect.objectContaining({ taskId, status: 'GENERATING' })
        );
        expect(claimFilter.updatedAt).toEqual({ $lt: expect.any(Date) });
    });

    it('regenerates when the stored completed set is incomplete', async () => {
        setExistingSet({
            _id: 'case-set-id',
            status: 'COMPLETED',
            testCases: [testCases[0]],
            taskDescriptionHash
        });
        testCaseFindOneAndUpdateMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ status: 'GENERATING' })
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(result).toMatchObject({ generated: true, reused: false });
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, taskDescriptionHash, status: 'GENERATING' },
            {
                $set: expect.objectContaining({
                    status: 'COMPLETED',
                    testCases
                })
            }
        );
    });

    it('regenerates after a previous failed generation', async () => {
        setExistingSet({
            _id: 'case-set-id',
            status: 'FAILED',
            testCases: [],
            taskDescriptionHash
        });
        testCaseFindOneAndUpdateMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({ status: 'GENERATING' })
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(result).toMatchObject({ generated: true, reused: false });
        expect(testCaseFindOneAndUpdateMock).toHaveBeenCalledWith(
            expect.objectContaining({ taskId, status: 'FAILED' }),
            { $set: expect.objectContaining({ status: 'GENERATING' }) },
            { new: true }
        );
    });

    it('does not write or call OpenRouter when a valid set is reused', async () => {
        setExistingSet({
            status: 'COMPLETED',
            testCases,
            taskDescriptionHash,
            generatedAt: new Date('2026-01-01T00:00:00.000Z')
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(result).toMatchObject({
            generated: false,
            reused: true,
            testCaseCount: 4
        });
        expect(testCaseUpdateOneMock).not.toHaveBeenCalled();
        expect(testCaseFindOneAndUpdateMock).not.toHaveBeenCalled();
        expect(testCaseCreateMock).not.toHaveBeenCalled();
    });

    it('rejects when the coding task cannot be found', async () => {
        taskFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('COURSE_TASK_NOT_FOUND');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('rejects a task that is not a coding task', async () => {
        taskFindByIdMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: taskId,
                type: 'VIDEO',
                taskName,
                taskDescription,
                moduleId: '66d323456789abcdef123457'
            })
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('NOT_CODING_TASK');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('rejects when the user is not assigned to the course', async () => {
        assignmentFindOneMock.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(null)
            })
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('TASK_NOT_ASSIGNED');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('marks generation failed and stores nothing when no OpenRouter key is saved', async () => {
        getKeyMock.mockResolvedValue(null);
        setExistingSet(null);
        testCaseCreateMock.mockResolvedValue({});

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('OPENROUTER_KEY_INVALID');

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, taskDescriptionHash, status: 'GENERATING' },
            { $set: { status: 'FAILED' } }
        );
    });
});
