import quizConfig from '../../config/quizConfig';

describe('quizConfig.getQuizPassingPercentage', () => {
    const originalValue = process.env.QUIZ_PASSING_PERCENTAGE;

    afterEach(() => {
        if (originalValue === undefined) {
            delete process.env.QUIZ_PASSING_PERCENTAGE;
        } else {
            process.env.QUIZ_PASSING_PERCENTAGE = originalValue;
        }
    });

    it('defaults to 60 when the env var is unset', () => {
        delete process.env.QUIZ_PASSING_PERCENTAGE;
        expect(quizConfig.getQuizPassingPercentage()).toBe(60);
    });

    it('defaults to 60 when the env var is blank', () => {
        process.env.QUIZ_PASSING_PERCENTAGE = '   ';
        expect(quizConfig.getQuizPassingPercentage()).toBe(60);
    });

    it('reads a valid configured percentage', () => {
        process.env.QUIZ_PASSING_PERCENTAGE = '75';
        expect(quizConfig.getQuizPassingPercentage()).toBe(75);
    });

    it('accepts the boundary values 0 and 100', () => {
        process.env.QUIZ_PASSING_PERCENTAGE = '0';
        expect(quizConfig.getQuizPassingPercentage()).toBe(0);

        process.env.QUIZ_PASSING_PERCENTAGE = '100';
        expect(quizConfig.getQuizPassingPercentage()).toBe(100);
    });

    it('falls back to 60 for non-numeric values', () => {
        process.env.QUIZ_PASSING_PERCENTAGE = 'abc';
        expect(quizConfig.getQuizPassingPercentage()).toBe(60);
    });

    it('falls back to 60 for out-of-range values', () => {
        process.env.QUIZ_PASSING_PERCENTAGE = '-5';
        expect(quizConfig.getQuizPassingPercentage()).toBe(60);

        process.env.QUIZ_PASSING_PERCENTAGE = '150';
        expect(quizConfig.getQuizPassingPercentage()).toBe(60);
    });
});
