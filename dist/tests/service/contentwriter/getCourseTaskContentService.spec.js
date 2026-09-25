"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseTaskContentService_1 = __importDefault(require("../../../services/contentwriter/getCourseTaskContentService"));
const courseTaskModel_1 = __importDefault(require("../../../model/courseTaskModel"));
jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));
const findByIdMock = courseTaskModel_1.default.findById;
describe('getCourseTaskContentService', () => {
    beforeEach(() => {
        findByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns the task content when found', async () => {
        const task = { _id: 't1', taskName: 'Read', type: 'FILE', content: 'key' };
        findByIdMock.mockResolvedValue(task);
        const result = await getCourseTaskContentService_1.default.getCourseTaskContent('t1');
        expect(findByIdMock).toHaveBeenCalledWith('t1');
        expect(result).toEqual({ success: true, task });
    });
    it('returns { success: false } when the task is not found', async () => {
        findByIdMock.mockResolvedValue(null);
        const result = await getCourseTaskContentService_1.default.getCourseTaskContent('missing');
        expect(findByIdMock).toHaveBeenCalledWith('missing');
        expect(result).toEqual({ success: false });
    });
    it('returns { success: false } when the query throws', async () => {
        findByIdMock.mockRejectedValue(new Error('Database failure'));
        const result = await getCourseTaskContentService_1.default.getCourseTaskContent('t1');
        expect(result).toEqual({ success: false });
    });
});
