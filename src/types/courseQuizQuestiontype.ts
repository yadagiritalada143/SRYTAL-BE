
export const COURSE_QUIZ_QUESTION_TYPES = [
    'RADIO',
    'CHECKBOX',
    'TOGGLE',
    'DROPDOWN',
    'TEXTAREA',
] as const;

export type CourseQuizQuestionType =
    (typeof COURSE_QUIZ_QUESTION_TYPES)[number];

export const COURSE_QUIZ_QUESTION_STATUSES = [
    'SHOW',
    'HIDE',
] as const;

export type CourseQuizQuestionStatus =
    (typeof COURSE_QUIZ_QUESTION_STATUSES)[number];
