"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COURSE_TASK_ERRORS_MESSAGES = exports.COURSE_TASK_SUCCESS_MESSAGES = void 0;
exports.COURSE_TASK_SUCCESS_MESSAGES = {
    COURSE_TASK_ADD_SUCCESS_MESSAGE: 'New Task added to Module Successfully !',
    COURSE_TASK_REORDER_SUCCESS_MESSAGE: 'Course tasks reordered successfully !',
};
exports.COURSE_TASK_ERRORS_MESSAGES = {
    COURSE_TASK_ADD_ERROR_MESSAGE: 'Error occured while adding Task to Module !',
    COURSE_TASK_UPDATE_ERROR_MESSAGE: 'Error occurred while updating the task !',
    COURSE_TASK_INVALID_STATUS_MESSAGE: 'Please provide valid status !',
    COURSE_TASK_MISSING_CONTENT_MESSAGE: 'Please provide a file or a link or code for the task content !',
    COURSE_TASK_CONTENT_FETCH_ERROR_MESSAGE: 'Error occured while fetching the task content !',
    COURSE_TASK_NOT_FOUND_MESSAGE: 'Task not found !',
    COURSE_TASK_INVALID_THUMBNAIL_TYPE_MESSAGE: 'Invalid thumbnail type. Supported types are JPG, JPEG, PNG, and WEBP.',
    COURSE_TASK_INVALID_FILE_TYPE_MESSAGE: 'Invalid file type. Supported types are PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, PNG, JPG, JPEG, and WEBP.',
    COURSE_TASK_INVALID_TYPE_MESSAGE: 'Invalid course task type. Allowed values are LINK, FILE, CODE, QUIZ !',
    COURSE_TASK_MISSING_CODING_QUESTION_MESSAGE: 'Please provide the coding question in the task description !',
    COURSE_TASK_OPENROUTER_KEY_MISSING_MESSAGE: 'Please add your OpenRouter API key before creating a coding task !',
    COURSE_TASK_BOILERPLATE_GENERATION_ERROR_MESSAGE: 'Unable to generate coding task boilerplate. Please try again !',
    COURSE_TASK_CODING_TASK_DESCRIPTION_MESSAGE: 'Please provide the coding task description !',
    COURSE_TASK_OPENROUTER_KEY_INVALID_MESSAGE: 'Invalid OpenRouter API key. Please check your key and try again !',
    COURSE_TASK_AUTHENTICATION_REQUIRED_MESSAGE: 'Authentication is required to access this resource. Please log in and try again !',
    COURSE_TASK_NAME_REQUIRED_MESSAGE: 'Please provide the task name !',
    COURSE_TASK_ACKNOWLEDGEMENT_FOR_FILE_ONLY_MESSAGE: 'Acknowledgement is applicable only for file type tasks !',
    COURSE_TASK_VALIDATION_ERROR_MESSAGE: 'Invalid course task request.',
    COURSE_TASK_QUIZ_TASK_MESSAGE: 'Please provide the Quiz task description !',
    COURSE_TASK_DUPLICATE_NAME_MESSAGE: 'A task with this name already exists in this module.',
    COURSE_TASK_INVALID_ORDER_IDX_MESSAGE: 'orderIdx is required and must be a positive integer.',
    COURSE_TASK_DUPLICATE_ORDER_IDX_MESSAGE: 'orderIdx already exists. Please use a different orderIdx.',
    COURSE_TASK_REORDER_ERROR_MESSAGE: 'Error occured while reordering the course tasks !',
    COURSE_TASK_INVALID_MODULE_ID_MESSAGE: 'Module ID must be a valid ID !',
    COURSE_TASK_MODULE_NOT_FOUND_MESSAGE: 'Module not found !',
    COURSE_TASK_TASKS_REQUIRED_MESSAGE: 'Tasks array is required and must not be empty !',
    COURSE_TASK_INVALID_TASK_ID_MESSAGE: 'One or more task IDs are invalid !',
    COURSE_TASK_TASK_NOT_FOUND_MESSAGE: 'One or more course tasks were not found !',
    COURSE_TASK_NOT_IN_MODULE_MESSAGE: 'One or more tasks do not belong to the specified module !',
    COURSE_TASK_DUPLICATE_TASK_ID_MESSAGE: 'Duplicate task IDs are not allowed !'
};
