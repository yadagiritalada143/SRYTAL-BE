export const MAX_QUIZ_QUESTIONS_PER_TASK = 100;

export const COURSE_QUIZ_QUESTION_SUCCESS_MESSAGES = {
    COURSE_QUIZ_QUESTION_ADD_SUCCESS_MESSAGE: 'Quiz question created successfully !',
    COURSE_QUIZ_QUESTION_FETCH_SUCCESS_MESSAGE: 'Quiz questions fetched successfully !',
    COURSE_QUIZ_QUESTION_FETCH_SINGLE_SUCCESS_MESSAGE: 'Quiz question fetched successfully !',
    COURSE_QUIZ_QUESTION_UPDATE_SUCCESS_MESSAGE: 'Quiz question updated successfully !',
    COURSE_QUIZ_QUESTION_STATUS_UPDATE_SUCCESS_MESSAGE: 'Quiz question status updated successfully !',
    COURSE_QUIZ_QUESTION_DELETE_SUCCESS_MESSAGE: 'Quiz question deleted successfully !',
    COURSE_QUIZ_QUESTION_SHOW_HIDE_SUCCESS_MESSAGE: 'Quiz question visibility updated successfully !',
};

export const COURSE_QUIZ_QUESTION_ERROR_MESSAGES = {
    COURSE_QUIZ_QUESTION_VALIDATION_ERROR_MESSAGE: 'Invalid quiz question request.',
    COURSE_QUIZ_QUESTION_MISSING_TASK_ID_MESSAGE: 'taskId is required !',
    COURSE_QUIZ_QUESTION_INVALID_TASK_ID_MESSAGE: 'Please provide a valid taskId !',
    COURSE_QUIZ_QUESTION_TASK_NOT_FOUND_MESSAGE: 'Task not found !',
    COURSE_QUIZ_QUESTION_NOT_QUIZ_TASK_MESSAGE: 'Questions can only be added to a quiz task !',
    COURSE_QUIZ_QUESTION_MISSING_TEXT_MESSAGE: 'Please provide the question text !',
    COURSE_QUIZ_QUESTION_INVALID_TYPE_MESSAGE: 'Invalid question type. Allowed values are RADIO, CHECKBOX, TOGGLE, DROPDOWN, TEXTAREA !',
    COURSE_QUIZ_QUESTION_INVALID_STATUS_MESSAGE: 'Invalid question status. Allowed values are SHOW and HIDE !',
    COURSE_QUIZ_QUESTION_MIN_OPTIONS_MESSAGE: 'Please provide at least two options !',
    COURSE_QUIZ_QUESTION_TOGGLE_OPTIONS_MESSAGE: 'A toggle question must have exactly two options !',
    COURSE_QUIZ_QUESTION_SINGLE_ANSWER_MESSAGE: 'Exactly one option must be marked as the correct answer !',
    COURSE_QUIZ_QUESTION_MIN_ANSWER_MESSAGE: 'At least one option must be marked as the correct answer !',
    COURSE_QUIZ_QUESTION_DUPLICATE_MESSAGE: 'This question is already part of the quiz !',
    COURSE_QUIZ_QUESTION_ADD_ERROR_MESSAGE: 'Error occurred while creating the quiz question !',
    COURSE_QUIZ_QUESTION_FETCH_ERROR_MESSAGE: 'Error occurred while fetching the quiz questions !',
    COURSE_QUIZ_QUESTION_FETCH_SINGLE_ERROR_MESSAGE: 'Error occurred while fetching the quiz question !',
    COURSE_QUIZ_QUESTION_UPDATE_ERROR_MESSAGE: 'Error occurred while updating the quiz question !',
    COURSE_QUIZ_QUESTION_STATUS_UPDATE_ERROR_MESSAGE: 'Error occurred while updating the quiz question status !',
    COURSE_QUIZ_QUESTION_DELETE_ERROR_MESSAGE: 'Error occurred while deleting the quiz question !',
    COURSE_QUIZ_QUESTION_SHOW_HIDE_ERROR_MESSAGE: 'Error occurred while updating the quiz question visibility !',
    COURSE_QUIZ_QUESTION_QUESTION_NOT_FOUND_MESSAGE: 'Quiz question not found !',
};
