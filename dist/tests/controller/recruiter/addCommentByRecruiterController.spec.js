"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCommentByRecruiterController_1 = __importDefault(require("../../../controllers/recruiter/addCommentByRecruiterController"));
const addCommentByRecruiterService_1 = __importDefault(require("../../../services/recruiter/addCommentByRecruiterService"));
const recruiterErrorMessages_1 = require("../../../constants/recruiterErrorMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/recruiter/addCommentByRecruiterService', () => ({
    __esModule: true,
    default: { addCommentByRecruiter: jest.fn() }
}));
const addCommentByRecruiterMock = addCommentByRecruiterService_1.default.addCommentByRecruiter;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addCommentByRecruiterController', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addCommentByRecruiterMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('adds a comment and returns 200 with the response after sorting existing comments', async () => {
        const req = {
            body: { id: 'c1', comment: 'Great' },
            user: { userId: 'u1' }
        };
        const responseAfterCommentAdded = {
            _id: 'c1',
            comments: [
                { comment: 'older', updateAt: new Date('2024-01-01T00:00:00Z') },
                { comment: 'newer', updateAt: new Date('2024-02-01T00:00:00Z') }
            ]
        };
        addCommentByRecruiterMock.mockResolvedValue(responseAfterCommentAdded);
        await addCommentByRecruiterController_1.default.addCommentByRecruiter(req, res);
        await flushMicrotasks();
        expect(addCommentByRecruiterMock).toHaveBeenCalledWith({ id: 'c1', comment: 'Great', userId: 'u1' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCommentAdded });
        expect(responseAfterCommentAdded.comments[0].comment).toBe('newer');
    });
    it('returns 200 when the response has no comments', async () => {
        const req = {
            body: { id: 'c1', comment: 'Great' },
            user: { userId: 'u1' }
        };
        const responseAfterCommentAdded = { _id: 'c1' };
        addCommentByRecruiterMock.mockResolvedValue(responseAfterCommentAdded);
        await addCommentByRecruiterController_1.default.addCommentByRecruiter(req, res);
        await flushMicrotasks();
        expect(addCommentByRecruiterMock).toHaveBeenCalledWith({ id: 'c1', comment: 'Great', userId: 'u1' });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
        expect(mockJson).toHaveBeenCalledWith({ responseAfterCommentAdded });
    });
    it('passes undefined as the userId when the request has no user', async () => {
        const req = { body: { id: 'c1', comment: 'Great' } };
        addCommentByRecruiterMock.mockResolvedValue({ _id: 'c1' });
        await addCommentByRecruiterController_1.default.addCommentByRecruiter(req, res);
        await flushMicrotasks();
        expect(addCommentByRecruiterMock).toHaveBeenCalledWith({ id: 'c1', comment: 'Great', userId: undefined });
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.OK);
    });
    it('returns 500 with the error message when the service throws', async () => {
        const req = {
            body: { id: 'c1', comment: 'Great' },
            user: { userId: 'u1' }
        };
        addCommentByRecruiterMock.mockRejectedValue(new Error('Service failure'));
        await addCommentByRecruiterController_1.default.addCommentByRecruiter(req, res);
        await flushMicrotasks();
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            message: recruiterErrorMessages_1.RECRUITER_ERROR_MESSAGES.ERROR_ADDING_COMMENT
        });
    });
});
