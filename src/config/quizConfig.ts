// Passing threshold for scored quizzes. Configurable via the
// QUIZ_PASSING_PERCENTAGE environment variable so operators can tune it
// without a code change; invalid or out-of-range values fall back to the
// default rather than breaking validation.
const DEFAULT_QUIZ_PASSING_PERCENTAGE = 60;

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
