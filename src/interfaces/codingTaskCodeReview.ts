export interface ICodingTaskCodeReviewStandards {
    readability: string;
    efficiency: string;
    errorHandling: string;
    namingConventions: string;
}

export interface ICodingTaskCodeReview {
    score: number;
    suggestions: string[];
    codingStandards: ICodingTaskCodeReviewStandards;
    explanation: string;
}

export interface ICodingTaskCodeReviewResult {
    feedback: ICodingTaskCodeReview | null;
    error: string | null;
}
