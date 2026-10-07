"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addCommentByRecruiterService_1 = __importDefault(require("../../../services/recruiter/addCommentByRecruiterService"));
const poolCompanies_1 = __importDefault(require("../../../model/poolCompanies"));
jest.mock('../../../model/poolCompanies', () => ({
    __esModule: true,
    default: {
        findByIdAndUpdate: jest.fn(),
        findOne: jest.fn()
    }
}));
const findByIdAndUpdateMock = poolCompanies_1.default.findByIdAndUpdate;
const findOneMock = poolCompanies_1.default.findOne;
describe('addCommentByRecruiterService', () => {
    beforeEach(() => {
        findByIdAndUpdateMock.mockReset();
        findOneMock.mockReset();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('updates the company and returns the populated company details when the result has an id', async () => {
        findByIdAndUpdateMock.mockResolvedValue({ _id: 'c1', id: 'c1', companyName: 'Acme' });
        const populatedDetails = {
            _id: 'c1',
            companyName: 'Acme',
            comments: [{ userId: 'u1', comment: 'Great', updateAt: new Date('2024-01-02T00:00:00Z') }]
        };
        const populateMock = jest.fn().mockReturnValue(populatedDetails);
        findOneMock.mockReturnValue({ populate: populateMock });
        const result = await addCommentByRecruiterService_1.default.addCommentByRecruiter({
            id: 'c1',
            comment: 'Great',
            userId: 'u1'
        });
        expect(findByIdAndUpdateMock).toHaveBeenCalledWith('c1', {
            lastUpdatedAt: expect.any(Date),
            $push: {
                comments: {
                    comment: 'Great',
                    userId: 'u1',
                    updateAt: expect.any(Date)
                }
            }
        }, { new: true });
        expect(findOneMock).toHaveBeenCalledWith({ _id: 'c1' });
        expect(populateMock).toHaveBeenCalledWith('comments.userId', 'firstName lastName');
        expect(result).toEqual(populatedDetails);
    });
    it('returns the update result directly when the result has no id', async () => {
        const updateResult = { acknowledged: true, comments: [] };
        findByIdAndUpdateMock.mockResolvedValue(updateResult);
        const result = await addCommentByRecruiterService_1.default.addCommentByRecruiter({
            id: 'c1',
            comment: 'Great',
            userId: 'u1'
        });
        expect(result).toEqual(updateResult);
        expect(findOneMock).not.toHaveBeenCalled();
    });
    it('rejects when the update throws', async () => {
        findByIdAndUpdateMock.mockRejectedValue(new Error('Update failed'));
        await expect(addCommentByRecruiterService_1.default.addCommentByRecruiter({ id: 'c1', comment: 'Great', userId: 'u1' })).rejects.toThrow('Update failed');
    });
});
