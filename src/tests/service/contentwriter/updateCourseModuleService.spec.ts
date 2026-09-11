import updateCourseModuleService from '../../../services/contentwriter/updateCourseModuleService';
import CourseModuleModel from '../../../model/coursemoduleModel';
import s3Client from '../../../util/s3Client';

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn(), updateOne: jest.fn() }
}));

jest.mock('../../../util/s3Client', () => ({
    __esModule: true,
    default: { deleteObject: jest.fn() }
}));

const findByIdMock = (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const updateOneMock = (CourseModuleModel as unknown as { updateOne: jest.Mock }).updateOne;
const deleteObjectMock = s3Client.deleteObject as unknown as jest.Mock;

describe('updateCourseModuleService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        updateOneMock.mockReset();
        deleteObjectMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns not found when the module does not exist', async () => {
        findByIdMock.mockResolvedValue(null);

        const result = await updateCourseModuleService.updateCourseModule('m1', 'Intro', 'First module');

        expect(findByIdMock).toHaveBeenCalledWith('m1');
        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, responseAfterModuleUpdate: 'Course module not found' });
    });

    it('updates the module with a new thumbnail and deletes the old one', async () => {
        findByIdMock.mockResolvedValue({ _id: 'm1', thumbnail: 'oldThumb.png' });
        deleteObjectMock.mockReturnValue({ promise: jest.fn().mockResolvedValue({}) });
        updateOneMock.mockResolvedValue({ modifiedCount: 1 });

        const result = await updateCourseModuleService.updateCourseModule('m1', 'Intro', 'First module', 'newThumb.png', 'ACTIVE');

        expect(deleteObjectMock).toHaveBeenCalledWith({
            Bucket: 'srytal-documents',
            Key: 'oldThumb.png'
        });
        expect(updateOneMock).toHaveBeenCalledWith(
            { _id: 'm1' },
            { moduleName: 'Intro', moduleDescription: 'First module', status: 'ACTIVE', thumbnail: 'newThumb.png' }
        );
        expect(result).toEqual({ success: true, responseAfterModuleUpdate: { modifiedCount: 1 } });
    });

    it('updates the module without a thumbnail and does not delete anything', async () => {
        findByIdMock.mockResolvedValue({ _id: 'm1', thumbnail: null });
        updateOneMock.mockResolvedValue({ modifiedCount: 1 });

        const result = await updateCourseModuleService.updateCourseModule('m1', 'Intro', 'First module', undefined, 'ACTIVE');

        expect(deleteObjectMock).not.toHaveBeenCalled();
        expect(updateOneMock).toHaveBeenCalledWith(
            { _id: 'm1' },
            { moduleName: 'Intro', moduleDescription: 'First module', status: 'ACTIVE' }
        );
        expect(result).toEqual({ success: true, responseAfterModuleUpdate: { modifiedCount: 1 } });
    });

    it('survives a failed thumbnail deletion', async () => {
        findByIdMock.mockResolvedValue({ _id: 'm1', thumbnail: 'oldThumb.png' });
        deleteObjectMock.mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('S3 down')) });
        updateOneMock.mockResolvedValue({ modifiedCount: 1 });

        const result = await updateCourseModuleService.updateCourseModule('m1', 'Intro', 'First module', 'newThumb.png', 'ACTIVE');

        expect(result).toEqual({ success: true, responseAfterModuleUpdate: { modifiedCount: 1 } });
    });

    it('returns { success: false } when the update returns no result', async () => {
        findByIdMock.mockResolvedValue({ _id: 'm1', thumbnail: null });
        updateOneMock.mockResolvedValue(null);

        const result = await updateCourseModuleService.updateCourseModule('m1', 'Intro', 'First module', undefined, 'ACTIVE');

        expect(result).toEqual({ success: false });
    });

    it('returns { success: false } when the update throws', async () => {
        findByIdMock.mockResolvedValue({ _id: 'm1', thumbnail: null });
        updateOneMock.mockRejectedValue(new Error('Database failure'));

        const result = await updateCourseModuleService.updateCourseModule('m1', 'Intro', 'First module', undefined, 'ACTIVE');

        expect(result).toEqual({ success: false, responseAfterModuleUpdate: expect.any(Error) });
    });
});