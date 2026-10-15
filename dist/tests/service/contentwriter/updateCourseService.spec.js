"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateCourseService_1 = __importDefault(require("../../../services/contentwriter/updateCourseService"));
const coursesModel_1 = __importDefault(require("../../../model/coursesModel"));
const s3Client_1 = __importDefault(require("../../../util/s3Client"));
jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findById: jest.fn(), updateOne: jest.fn() }
}));
jest.mock('../../../util/s3Client', () => ({
    __esModule: true,
    default: { deleteObject: jest.fn() }
}));
const findByIdMock = coursesModel_1.default.findById;
const updateOneMock = coursesModel_1.default.updateOne;
const deleteObjectMock = s3Client_1.default.deleteObject;
describe('updateCourseService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        updateOneMock.mockReset();
        deleteObjectMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns not found when the course does not exist', async () => {
        findByIdMock.mockResolvedValue(null);
        const result = await updateCourseService_1.default.updateCourse('c1', 'React', 'Frontend');
        expect(findByIdMock).toHaveBeenCalledWith('c1');
        expect(updateOneMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, responseAfterUpdateCourse: 'Course not found' });
    });
    it('updates the course with a new thumbnail and deletes the old one', async () => {
        findByIdMock.mockResolvedValue({ _id: 'c1', thumbnail: 'oldThumb.png' });
        deleteObjectMock.mockReturnValue({ promise: jest.fn().mockResolvedValue({}) });
        updateOneMock.mockResolvedValue({ modifiedCount: 1 });
        const result = await updateCourseService_1.default.updateCourse('c1', 'React', 'Frontend', 'newThumb.png', 'ACTIVE');
        expect(deleteObjectMock).toHaveBeenCalledWith({
            Bucket: 'srytal-documents',
            Key: 'oldThumb.png'
        });
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'c1' }, { courseName: 'React', courseDescription: 'Frontend', status: 'ACTIVE', thumbnail: 'newThumb.png' });
        expect(result).toEqual({ success: true, responseAfterUpdateCourse: { modifiedCount: 1 } });
    });
    it('updates the course without a thumbnail and does not delete anything', async () => {
        findByIdMock.mockResolvedValue({ _id: 'c1', thumbnail: null });
        updateOneMock.mockResolvedValue({ modifiedCount: 1 });
        const result = await updateCourseService_1.default.updateCourse('c1', 'React', 'Frontend', undefined, 'ACTIVE');
        expect(deleteObjectMock).not.toHaveBeenCalled();
        expect(updateOneMock).toHaveBeenCalledWith({ _id: 'c1' }, { courseName: 'React', courseDescription: 'Frontend', status: 'ACTIVE' });
        expect(result).toEqual({ success: true, responseAfterUpdateCourse: { modifiedCount: 1 } });
    });
    it('survives a failed thumbnail deletion', async () => {
        findByIdMock.mockResolvedValue({ _id: 'c1', thumbnail: 'oldThumb.png' });
        deleteObjectMock.mockReturnValue({ promise: jest.fn().mockRejectedValue(new Error('S3 down')) });
        updateOneMock.mockResolvedValue({ modifiedCount: 1 });
        const result = await updateCourseService_1.default.updateCourse('c1', 'React', 'Frontend', 'newThumb.png', 'ACTIVE');
        expect(result).toEqual({ success: true, responseAfterUpdateCourse: { modifiedCount: 1 } });
    });
    it('returns { success: false } when the update returns no result', async () => {
        findByIdMock.mockResolvedValue({ _id: 'c1', thumbnail: null });
        updateOneMock.mockResolvedValue(null);
        const result = await updateCourseService_1.default.updateCourse('c1', 'React', 'Frontend', undefined, 'ACTIVE');
        expect(result).toEqual({ success: false });
    });
    it('returns { success: false } when the update throws', async () => {
        findByIdMock.mockResolvedValue({ _id: 'c1', thumbnail: null });
        updateOneMock.mockRejectedValue(new Error('Database failure'));
        const result = await updateCourseService_1.default.updateCourse('c1', 'React', 'Frontend', undefined, 'ACTIVE');
        expect(result).toEqual({ success: false, responseAfterUpdateCourse: expect.any(Error) });
    });
});
