import axios from 'axios';
import { Types } from 'mongoose';
import CourseAssignment from '../../../model/courseAssignmentModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseTaskModel from '../../../model/courseTaskModel';
import ProgrammingLanguages from '../../../model/programmingLanguagesModel';
import getUserOpenRouterKeyService from '../../../services/useropenrouter/getUserOpenRouterKeyService';
import courseTaskBoilerplateService from '../../../services/common/courseTaskBoilerplateService';

jest.mock('axios', () => ({
    __esModule: true,
    default: { post: jest.fn() }
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
    default: { findById: jest.fn(), updateOne: jest.fn() }
}));

jest.mock('../../../model/programmingLanguagesModel', () => ({
    __esModule: true,
    default: { findOne: jest.fn() }
}));

jest.mock('../../../services/useropenrouter/getUserOpenRouterKeyService', () => ({
    __esModule: true,
    default: { getUserOpenRouterKeyService: jest.fn() }
}));

const axiosPostMock = axios.post as jest.Mock;
const taskFindByIdMock = CourseTaskModel.findById as jest.Mock;
const taskUpdateOneMock = CourseTaskModel.updateOne as jest.Mock;
const moduleFindByIdMock = CourseModuleModel.findById as jest.Mock;
const languageFindOneMock = ProgrammingLanguages.findOne as jest.Mock;
const assignmentFindOneMock = CourseAssignment.findOne as jest.Mock;
const getUserOpenRouterKeyMock =
    getUserOpenRouterKeyService.getUserOpenRouterKeyService as jest.Mock;

const taskId = '66d323456789abcdef123456';
const languageId = '66d323456789abcdef123458';
const userId = '66d323456789abcdef123459';

const setLeanResult = (mock: jest.Mock, result: unknown) => {
    mock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result)
    });
};

describe('courseTaskBoilerplateService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getUserOpenRouterKeyMock.mockResolvedValue({ openrouterKey: 'sk-test' });
        axiosPostMock.mockResolvedValue({
            data: { choices: [{ message: { content: 'function solve(value) {\n  // TODO\n}' } }] }
        });
        setLeanResult(taskFindByIdMock, {
            _id: taskId,
            type: 'CODE',
            taskDescription: 'Return the input value.',
            baseBoilerplate: 'function solve(value) { /* TODO */ }',
            starterCode: [],
            moduleId: '66d323456789abcdef123457'
        });
        setLeanResult(moduleFindByIdMock, { courseId: '66d323456789abcdef123460' });
        setLeanResult(languageFindOneMock, {
            languageName: 'JavaScript',
            canonicalKey: 'javascript'
        });
        setLeanResult(assignmentFindOneMock, { _id: 'assignment1' });
        taskUpdateOneMock.mockResolvedValue({ matchedCount: 1 });
    });

    it('generates a language-neutral function skeleton with the authenticated user key', async () => {
        axiosPostMock.mockResolvedValueOnce({
            data: {
                choices: [{
                    message: {
                        content: 'function solve(value) {\n  // TODO: implement\n}'
                    }
                }]
            }
        });

        const result = await courseTaskBoilerplateService.generateBaseBoilerplate(
            'Return the input value.',
            userId
        );

        expect(result).toContain('function solve(value)');
        expect(getUserOpenRouterKeyMock).toHaveBeenCalledWith(userId);
        expect(axiosPostMock.mock.calls[0][1].messages[1].content)
            .toContain('Return the input value.');
        expect(axiosPostMock.mock.calls[0][2].headers.Authorization)
            .toBe('Bearer sk-test');
    });

    it('reports a missing coding description with the API-recognized error code', async () => {
        await expect(
            courseTaskBoilerplateService.generateBaseBoilerplate('', userId)
        ).rejects.toThrow('CODING_TASK_DESCRIPTION_REQUIRED');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('returns cached starter code for the requested language ID', async () => {
        setLeanResult(taskFindByIdMock, {
            _id: taskId,
            type: 'CODE',
            taskDescription: 'Return the input value.',
            starterCode: [{ languageId, code: 'function solve(value) {}' }],
            moduleId: '66d323456789abcdef123457'
        });

        const result =
            await courseTaskBoilerplateService.getOrGenerateCourseTaskBoilerplate(
                taskId,
                languageId,
                userId
            );

        expect(result).toBe('function solve(value) {}');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('rejects a coding task with no description before generating language code', async () => {
        setLeanResult(taskFindByIdMock, {
            _id: taskId,
            type: 'CODE',
            taskDescription: '',
            starterCode: [],
            moduleId: '66d323456789abcdef123457'
        });

        await expect(
            courseTaskBoilerplateService.getOrGenerateCourseTaskBoilerplate(
                taskId,
                languageId,
                userId
            )
        ).rejects.toThrow('CODING_TASK_DESCRIPTION_REQUIRED');
        expect(axiosPostMock).not.toHaveBeenCalled();
    });

    it('generates and stores starter code using the task and selected language', async () => {
        axiosPostMock.mockResolvedValueOnce({
            data: {
                choices: [{
                    message: {
                        content: '```javascript\nfunction solve(value) {\n  // TODO\n}\n```'
                    }
                }]
            }
        });

        const result =
            await courseTaskBoilerplateService.getOrGenerateCourseTaskBoilerplate(
                taskId,
                languageId,
                userId
            );

        expect(result).toBe('function solve(value) {\n  // TODO\n}');
        expect(taskFindByIdMock).toHaveBeenCalledWith(new Types.ObjectId(taskId));
        expect(languageFindOneMock).toHaveBeenCalledWith({
            _id: new Types.ObjectId(languageId),
            isActive: true
        });
        expect(assignmentFindOneMock).toHaveBeenCalledWith({
            employeeId: userId,
            courseId: '66d323456789abcdef123460'
        });
        expect(axiosPostMock.mock.calls[0][1].messages[1].content)
            .toContain('Base function skeleton:\nfunction solve(value) { /* TODO */ }');
        expect(taskUpdateOneMock).toHaveBeenCalledWith(
            expect.objectContaining({
                _id: expect.anything(),
                'starterCode.languageId': { $ne: expect.anything() }
            }),
            {
                $push: {
                    starterCode: expect.objectContaining({
                        languageId: expect.anything(),
                        code: result,
                        boilerplateVersion: 1
                    })
                }
            }
        );
    });
});
