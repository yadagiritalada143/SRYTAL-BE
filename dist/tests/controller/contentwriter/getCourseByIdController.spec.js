"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getCourseByIdController_1 = __importDefault(require("../../../controllers/contentwriter/getCourseByIdController"));
const getCourseByIdService_1 = __importDefault(require("../../../services/contentwriter/getCourseByIdService"));
const courseMessages_1 = require("../../../constants/contentwriter/courseMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/contentwriter/getCourseByIdService', () => ({
    __esModule: true,
    default: { getCourseById: jest.fn() }
}));
const getCourseByIdMock = getCourseByIdService_1.default.getCourseById;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('getCourseByIdController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        getCourseByIdMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 200 with the course details', async () => {
        const req = { params: { id: 'c1' } };
        const courseResponse = { success: true, coursedata: { _id: 'c1', courseName: 'React' } };
        getCourseByIdMock.mockResolvedValue(courseResponse);
        getCourseByIdController_1.default.getCourseDetailsById(req, res);
        await flushMicrotasks();
        expect(getCourseByIdMock).toHaveBeenCalledWith('c1');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith(courseResponse);
    });
    it('returns 500 when the service rejects', async () => {
        const req = { params: { id: 'c1' } };
        getCourseByIdMock.mockRejectedValue(new Error('Service failure'));
        getCourseByIdController_1.default.getCourseDetailsById(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: courseMessages_1.COURSE_ERROR_MESSAGES.COURSE_ADD_ERROR_MESSAGE
        });
    });
});
