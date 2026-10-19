export const COURSE_SUCCESS_MESSAGES = {
    COURSE_ADD_SUCCESS_MESSAGE: 'New Course added Successfully !',
    ACTIVE_COURSES_FETCH_SUCCESS_MESSAGE: 'fetching active courses Successfully !',
    COURSE_CLONE_SUCCESS_MESSAGE: 'Course cloned Successfully !'
};

export const COURSE_ERROR_MESSAGES = {
    COURSE_ADD_ERROR_MESSAGE: 'Error occured while adding new Course !',
    COURSE_FETCH_ERROR_MESSAGE: 'Error in fetching course details !',
    COURSE_UPDATE_ERROR_MESSAGE: 'Error occurred while updating the Course !',
    COURSE_INVALID_STATUS_MESSAGE: 'Please provide valid status !',
    COURSE_VALIDATION_ERROR_MESSAGE: 'Invalid course details.',
    COURSE_CLONE_ERROR_MESSAGE: 'Error occured while cloning the Course !',
    COURSE_CLONE_DUPLICATE_NAME_MESSAGE: 'Course name already exists. Please provide a different course name.',
    COURSE_CLONE_SOURCE_NOT_FOUND_MESSAGE: 'Source course not found !',
    COURSE_CLONE_SOURCE_NOT_ARCHIVED_MESSAGE: 'Only an archived course can be cloned !',
    COURSE_CLONE_INVALID_MODULE_MESSAGE: 'One or more selected modules do not belong to the source course !',
    COURSE_CLONE_INVALID_TASK_MESSAGE: 'One or more selected tasks do not belong to the selected module !',
};

/** Stable machine-readable codes used to map service failures to HTTP statuses. */
export const COURSE_CLONE_ERROR_CODES = {
    SOURCE_NOT_FOUND: 'SOURCE_COURSE_NOT_FOUND',
    SOURCE_NOT_ARCHIVED: 'SOURCE_COURSE_NOT_ARCHIVED',
    INVALID_MODULE: 'INVALID_MODULE_SELECTION',
    INVALID_TASK: 'INVALID_TASK_SELECTION',
    CLONE_FAILED: 'COURSE_CLONE_FAILED',
    DUPLICATE_NAME: 'COURSE_CLONE_DUPLICATE_NAME'
};
