import mongoose from 'mongoose';
import CourseQuizQuestionModel from '../../../model/courseQuizQuestionModel';
import getQuizQuestionByIdService from '../../../services/contentwriter/getQuizQuestionByIdService';

jest.mock('../../../model/courseQuizQuestionModel');

describe('getQuizQuestionByIdService', () => {
    const mockFindOne = CourseQuizQuestionModel.findOne as jest.Mock;
    const questionId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns questionNotFound when no non-deleted question exists', async () => {
        mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

        const result = await getQuizQuestionByIdService.getQuizQuestionById(questionId);

        expect(mockFindOne).toHaveBeenCalledWith({ _id: questionId, isDeleted: false });
        expect(result).toEqual({ success: false, questionNotFound: true });
    });

    it('returns question when found', async () => {
        const question = { _id: questionId, question: 'Q1', type: 'RADIO', isDeleted: false };
        mockFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(question) });

        const result = await getQuizQuestionByIdService.getQuizQuestionById(questionId);

        expect(result).toEqual({ success: true, question });
    });

    it('returns success false on error', async () => {
        mockFindOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error('db error')) });

        const result = await getQuizQuestionByIdService.getQuizQuestionById(questionId);

        expect(result.success).toBe(false);
    });
});
