import addCourseTaskService from '../../../services/contentwriter/addCourseTaskService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';
import courseTaskBoilerplateService from '../../../services/common/courseTaskBoilerplateService';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

jest.mock('../../../services/common/courseTaskBoilerplateService', () => ({
    __esModule: true,
    default: { generateBaseBoilerplate: jest.fn() }
}));

const CourseTaskModelMock = CourseTaskModel as unknown as jest.Mock;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const findByIdAndUpdateMock = (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;
const generateBaseBoilerplateMock = courseTaskBoilerplateService.generateBaseBoilerplate as unknown as jest.Mock;

describe('addCourseTaskService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        CourseTaskModelMock.mockReset();
        moduleFindByIdMock.mockReset();
        findByIdAndUpdateMock.mockReset();
        generateBaseBoilerplateMock.mockReset();
        saveSpy = jest.fn();
        CourseTaskModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const callService = (overrides: any = {}) =>
        addCourseTaskService.addCourseTask(
            'm1',
            'Read',
            'Read the docs',
            'thumb.png',
            'ACTIVE',
            'LINK',
            'https://example.com',
            '',
            '',
            'emp1',
            overrides.acknowledgementText
        );

    it('saves the task, touches the parent course, and returns the saved document', async () => {
        const savedTask = { _id: 't1', moduleId: 'm1', taskName: 'Read', type: 'LINK' };
        saveSpy.mockResolvedValue(savedTask);
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ courseId: 'c1' }) });
        findByIdAndUpdateMock.mockResolvedValue({});

        const result = await callService();

        expect(CourseTaskModelMock).toHaveBeenCalledTimes(1);
        expect(CourseTaskModelMock).toHaveBeenCalledWith({
            moduleId: 'm1',
            taskName: 'Read',
            taskDescription: 'Read the docs',
            thumbnail: 'thumb.png',
            status: 'ACTIVE',
            type: 'LINK',
            content: 'https://example.com',
            contentMimeType: '',
            contentFileName: ''
        });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(moduleFindByIdMock).toHaveBeenCalledWith('m1');
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith('c1', { $currentDate: { updatedAt: true } });
        expect(result).toEqual(savedTask);
    });

    it('persists and sanitizes the acknowledgement text on a FILE task', async () => {
        const savedTask = { _id: 't1', moduleId: 'm1', taskName: 'Read', type: 'FILE' };
        saveSpy.mockResolvedValue(savedTask);
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ courseId: 'c1' }) });
        findByIdAndUpdateMock.mockResolvedValue({});

        const result = await addCourseTaskService.addCourseTask(
            'm1',
            'Read',
            'Read the docs',
            'thumb.png',
            'ACTIVE',
            'FILE',
            'LMSData/Courses/CourseTaskContent/video.mp4',
            'video/mp4',
            'video.mp4',
            'emp1',
            '  I have <b>read</b> &amp; understood.  '
        );

        expect(CourseTaskModelMock).toHaveBeenCalledWith({
            moduleId: 'm1',
            taskName: 'Read',
            taskDescription: 'Read the docs',
            thumbnail: 'thumb.png',
            status: 'ACTIVE',
            type: 'FILE',
            content: 'LMSData/Courses/CourseTaskContent/video.mp4',
            contentMimeType: 'video/mp4',
            contentFileName: 'video.mp4',
            acknowledgementText: 'I have read & understood.'
        });
        expect(result).toEqual(savedTask);
    });

    it('omits the acknowledgement text when it is not provided', async () => {
        saveSpy.mockResolvedValue({ _id: 't2' });
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ courseId: 'c1' }) });
        findByIdAndUpdateMock.mockResolvedValue({});

        await callService();

        const modelCall = CourseTaskModelMock.mock.calls[0][0];
        expect(modelCall).not.toHaveProperty('acknowledgementText');
    });

    it('generates boilerplate for CODE tasks and saves it on the task', async () => {
        saveSpy.mockResolvedValue({ _id: 't3', type: 'CODE' });
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ courseId: 'c1' }) });
        findByIdAndUpdateMock.mockResolvedValue({});
        generateBaseBoilerplateMock.mockResolvedValue('BOILERPLATE');

        await addCourseTaskService.addCourseTask(
            'm1',
            'Reverse string',
            'Write a function to reverse a string.',
            'thumb.png',
            'ACTIVE',
            'CODE',
            '',
            '',
            '',
            'emp1'
        );

        expect(generateBaseBoilerplateMock).toHaveBeenCalledWith('Write a function to reverse a string.', 'emp1');
        const modelCall = CourseTaskModelMock.mock.calls[0][0];
        expect(modelCall.baseBoilerplate).toBe('BOILERPLATE');
    });

    it('does not touch the course when the module has no courseId', async () => {
        saveSpy.mockResolvedValue({ _id: 't2' });
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
        findByIdAndUpdateMock.mockResolvedValue({});

        const result = await callService();

        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
        expect(result).toEqual({ _id: 't2' });
    });

    it('re-throws when saving throws', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));

        await expect(callService()).rejects.toThrow('Save failed');
        expect(moduleFindByIdMock).not.toHaveBeenCalled();
    });

    it('re-throws known coding task boilerplate errors', async () => {
        saveSpy.mockResolvedValue({ _id: 't4', type: 'CODE' });
        generateBaseBoilerplateMock.mockRejectedValue(new Error('OPENROUTER_KEY_NOT_FOUND'));

        await expect(
            addCourseTaskService.addCourseTask(
                'm1',
                'Reverse string',
                'Write a function to reverse a string.',
                'thumb.png',
                'ACTIVE',
                'CODE',
                '',
                '',
                '',
                'emp1'
            )
        ).rejects.toThrow('OPENROUTER_KEY_NOT_FOUND');
    });
});