"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quizQuestion_1 = require("../constants/common/quizQuestion");
const getQuizPassingPercentage = () => {
    const raw = process.env.QUIZ_PASSING_PERCENTAGE;
    if (!raw || !raw.trim()) {
        return quizQuestion_1.DEFAULT_QUIZ_PASSING_PERCENTAGE;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return quizQuestion_1.DEFAULT_QUIZ_PASSING_PERCENTAGE;
    }
    return parsed;
};
exports.default = { getQuizPassingPercentage };
