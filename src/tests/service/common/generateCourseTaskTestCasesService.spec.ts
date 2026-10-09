import axios from 'axios';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import CodingTaskTestCaseModel from '../../../model/codingTaskTestCaseModel';
import generateCourseTaskTestCasesService from '../../../services/common/generateCourseTaskTestCasesService';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        post: jest.fn()
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
const savedKey = 'sk-or-saved-secret';
const generatedCases = Array.from({ length: 5 }, (_, index) => ({
    id: `TC${String(index + 1).padStart(3, '0')}`,
    name: `Case ${index + 1}`,
    input: String(index + 1),
    expectedOutput: String(index + 1),
    category: index === 0 ? 'basic' : 'edge'
}));
const openRouterContent = JSON.stringify({ testCases: generatedCases });

const taskFindByIdMock = (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const assignmentFindOneMock = (CourseAssignment as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneMock =
    (CodingTaskTestCaseModel as unknown as { findOne: jest.Mock }).findOne;
const testCaseFindOneAndUpdateMock =
    (CodingTaskTestCaseModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const testCaseCreateMock =
    (CodingTaskTestCaseModel as unknown as { create: jest.Mock }).create;
const testCaseUpdateOneMock =
    (CodingTaskTestCaseModel as unknown as { updateOne: jest.Mock }).updateOne;
const axiosPostMock = axios.post as jest.Mock;
const getKeyMock = getUserOpenRouterKeyService.getUserOpenRouterKeyService as jest.Mock;

const setTaskAccessMocks = (): void => {
    taskFindByIdMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
            _id: taskId,
            type: 'CODE',
            taskDescription: 'Read an integer and output its square.',
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
};

describe('generateCourseTaskTestCasesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setTaskAccessMocks();
        getKeyMock.mockResolvedValue({ openrouterKey: savedKey });
        testCaseFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });
        testCaseCreateMock.mockResolvedValue({});
        testCaseUpdateOneMock.mockResolvedValue({});
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: openRouterContent } }] }
        });
    });

    it('generates and stores 5 validated test cases using the saved user key', async () => {
        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(getKeyMock).toHaveBeenCalledWith(userId);
        expect(axiosPostMock).toHaveBeenCalledTimes(1);
        expect(axiosPostMock.mock.calls[0][1].max_tokens).toBe(10000);
        expect(axiosPostMock.mock.calls[0][2].headers.Authorization).toBe(`Bearer ${savedKey}`);
        const prompt = axiosPostMock.mock.calls[0][1].messages[1].content;
        const systemPrompt = axiosPostMock.mock.calls[0][1].messages[0].content;
        expect(systemPrompt).toContain('ONLY the supplied coding-task statement');
        expect(prompt).toContain('Read an integer and output its square.');
        expect(prompt).not.toContain('submitted code');

        expect(testCaseCreateMock).toHaveBeenCalledWith(expect.objectContaining({
            taskId,
            status: 'GENERATING',
            testCases: []
        }));
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, status: 'GENERATING' },
            {
                $set: expect.objectContaining({
                    status: 'COMPLETED',
                    testCases: generatedCases,
                    generatedBy: 'OpenRouter'
                })
            }
        );
        expect(result).toMatchObject({
            taskId,
            generated: true,
            reused: false,
            testCaseCount: 5
        });
        expect(result).not.toHaveProperty('testCases');
        expect(JSON.stringify(result)).not.toContain(savedKey);
    });

    it('reuses valid legacy generated sets with fewer than five cases', async () => {
        testCaseFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                status: 'COMPLETED',
                testCases: generatedCases.slice(0, 3),
                generatedAt: new Date('2026-10-01T00:00:00Z')
            })
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            generated: false,
            reused: true,
            testCaseCount: 3
        });
    });

    it('reuses stored cases without calling OpenRouter', async () => {
        testCaseFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                status: 'COMPLETED',
                testCases: generatedCases,
                generatedAt: new Date('2026-10-01T00:00:00Z')
            })
        });

        const result =
            await generateCourseTaskTestCasesService.generateCourseTaskTestCases(
                taskId,
                userId
            );

        expect(axiosPostMock).not.toHaveBeenCalled();
        expect(getKeyMock).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            generated: false,
            reused: true,
            testCaseCount: 5
        });
    });

    it('only regenerates existing completed cases when explicitly requested', async () => {
        testCaseFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: 'case-set-id',
                status: 'COMPLETED',
                testCases: generatedCases
            })
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

    it('rejects a generated set below the configured minimum count', () => {
        expect(() =>
            generateCourseTaskTestCasesService.parseGeneratedTestCases(
                JSON.stringify({ testCases: generatedCases.slice(0, 2) })
            )
        ).toThrow('INVALID_GENERATED_TEST_CASES');
    });

    it('rejects entries missing required input or output fields', () => {
        const malformedCases = generatedCases.map((testCase) => ({ ...testCase }));
        delete (malformedCases[0] as Partial<typeof malformedCases[number]>).expectedOutput;
        expect(() =>
            generateCourseTaskTestCasesService.parseGeneratedTestCases(
                JSON.stringify({ testCases: malformedCases })
            )
        ).toThrow('INVALID_GENERATED_TEST_CASES');
    });

    it('normalizes model-generated IDs, category aliases, scalar outputs, and extra fields', () => {
        const cases = generatedCases.map((testCase, index) => ({
            ...testCase,
            id: `case-${index}`,
            input: index,
            expectedOutput: index * index,
            category: 'normal_case',
            modelNote: 'ignored'
        }));

        const parsed = generateCourseTaskTestCasesService.parseGeneratedTestCases(
            `Generated JSON follows:\n${JSON.stringify({ testCases: cases })}`,
        );

        expect(parsed[0]).toEqual({
            id: 'TC001',
            name: 'Case 1',
            input: '0',
            expectedOutput: '0',
            category: 'basic'
        });
    });

    it('accepts the configured upper bound of 6 cases and generates sequential IDs', () => {
        const sixCases = Array.from({ length: 6 }, (_, index) => ({
            ...generatedCases[index % generatedCases.length],
            id: `TC${String(index + 1).padStart(3, '0')}`,
            name: `Case ${index + 1}`,
            input: String(index + 1),
            expectedOutput: String((index + 1) * (index + 1))
        }));
        const parsed = generateCourseTaskTestCasesService.parseGeneratedTestCases(
            JSON.stringify({ testCases: sixCases })
        );

        expect(parsed).toHaveLength(6);
        expect(parsed[5].id).toBe('TC006');
    });

    it('rejects a generated set above the configured maximum count', () => {
        const sevenCases = Array.from({ length: 7 }, (_, index) => ({
            ...generatedCases[index % generatedCases.length],
            id: `TC${String(index + 1).padStart(3, '0')}`,
            name: `Case ${index + 1}`,
            input: String(index + 1),
            expectedOutput: String((index + 1) * (index + 1))
        }));

        expect(() =>
            generateCourseTaskTestCasesService.parseGeneratedTestCases(
                JSON.stringify({ testCases: sevenCases })
            )
        ).toThrow('INVALID_GENERATED_TEST_CASES');
    });

    it('rejects a response that OpenRouter reports as truncated', async () => {
        axiosPostMock.mockResolvedValue({
            data: {
                choices: [{
                    finish_reason: 'length',
                    message: { content: openRouterContent }
                }]
            }
        });

        await expect(
            generateCourseTaskTestCasesService.generateCourseTaskTestCases(taskId, userId)
        ).rejects.toThrow('INVALID_GENERATED_TEST_CASES');
        expect(testCaseUpdateOneMock).toHaveBeenCalledWith(
            { taskId, status: 'GENERATING' },
            { $set: { status: 'FAILED' } }
        );
    });
});
