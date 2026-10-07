import addCourseModuleService from '../../../services/contentwriter/addCourseModuleService';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

const CourseModuleModelMock = CourseModuleModel as unknown as jest.Mock;
const findByIdAndUpdateMock = (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

describe('addCourseModuleService', () => {
    let saveSpy: jest.Mock;

    beforeEach(() => {
        CourseModuleModelMock.mockReset();
        findByIdAndUpdateMock.mockReset();
        saveSpy = jest.fn();
        CourseModuleModelMock.mockReturnValue({ save: saveSpy });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('saves the module, touches the parent course, and returns the saved document', async () => {
        const savedModule = { _id: 'm1', courseId: 'c1', moduleName: 'Intro', moduleDescription: 'First module' };
        saveSpy.mockResolvedValue(savedModule);
        findByIdAndUpdateMock.mockResolvedValue({});

        const result = await addCourseModuleService.addNewCourseModule('c1', 'Intro', 'First module', 'thumb.png', 'ACTIVE');

        expect(CourseModuleModelMock).toHaveBeenCalledTimes(1);
        expect(CourseModuleModelMock).toHaveBeenCalledWith({
            courseId: 'c1',
            moduleName: 'Intro',
            moduleDescription: 'First module',
            thumbnail: 'thumb.png',
            status: 'ACTIVE'
        });
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(findByIdAndUpdateMock).toHaveBeenCalledTimes(1);
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith('c1', { $currentDate: { updatedAt: true } });
        expect(result).toEqual(savedModule);
    });

    it('returns { success: false } when saving throws', async () => {
        saveSpy.mockRejectedValue(new Error('Save failed'));

        const result = await addCourseModuleService.addNewCourseModule('c1', 'Intro', 'First module', 'thumb.png', 'ACTIVE');

        expect(CourseModuleModelMock).toHaveBeenCalledTimes(1);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false });
    });
});