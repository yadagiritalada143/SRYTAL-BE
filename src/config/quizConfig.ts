import {DEFAULT_QUIZ_PASSING_PERCENTAGE } from '../constants/common/quizQuestion';

const getQuizPassingPercentage = (): number => {
    const raw = process.env.QUIZ_PASSING_PERCENTAGE;

    if (!raw || !raw.trim()) {
        return DEFAULT_QUIZ_PASSING_PERCENTAGE;
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return DEFAULT_QUIZ_PASSING_PERCENTAGE;
    }

    return parsed;
};

export default { getQuizPassingPercentage };
