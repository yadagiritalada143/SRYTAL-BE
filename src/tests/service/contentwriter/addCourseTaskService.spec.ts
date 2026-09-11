import addCourseTaskService from '../../../services/contentwriter/addCourseTaskService';
import CourseTaskModel from '../../../model/courseTaskModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';

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

const CourseTaskModelMock = CourseTaskModel as unknown as jest.Mock;
const moduleFindByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const findByIdAndUpdateMock = (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

describe('addCourseTaskService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        CourseTaskModelMock.mockReset();
        moduleFindByIdMock.mockReset();
        findByIdAndUpdateMock.mockReset();
        saveSpy = jest.fn();
        CourseTaskModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const buildArgs = (overrides: any = {}) => ({
        moduleId: 'm1',
        taskName: 'Read',
        taskDescription: 'Read the docs',
        thumbnail: 'thumb.png',
        status: 'ACTIVE',
        type: 'LINK',
        content: 'https://example.com',
        contentMimeType: '',
        contentFileName: '',
        ...overrides
    });

    it('saves the task, touches the parent course, and returns the saved document', async () => {
        const savedTask = { _id: 't1', moduleId: 'm1', taskName: 'Read', type: 'LINK' };
        saveSpy.mockResolvedValue(savedTask);
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue({ courseId: 'c1' }) });
        findByIdAndUpdateMock.mockResolvedValue({});

        const args = buildArgs();
        const result = await addCourseTaskService.addCourseTask(
            args.moduleId,
            args.taskName,
            args.taskDescription,
            args.thumbnail,
            args.status,
            args.type,
            args.content,
            args.contentMimeType,
            args.contentFileName
        );

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

    it('does not touch the course when the module has no courseId', async () => {
        saveSpy.mockResolvedValue({ _id: 't2' });
        moduleFindByIdMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

        const args = buildArgs();
        const result = await addCourseTaskService.addCourseTask(
            args.moduleId,
            args.taskName,
            args.taskDescription,
            args.thumbnail,
            args.status,
            args.type,
            args.content,
            args.contentMimeType,
            args.contentFileName
        );

        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
        expect(result).toEqual({ _id: 't2' });
    });

    it('returns { success: false } when saving throws', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));

        const args = buildArgs();
        const result = await addCourseTaskService.addCourseTask(
            args.moduleId,
            args.taskName,
            args.taskDescription,
            args.thumbnail,
            args.status,
            args.type,
            args.content,
            args.contentMimeType,
            args.contentFileName
        );

        expect(CourseTaskModelMock).toHaveBeenCalledTimes(1);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(moduleFindByIdMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });
});