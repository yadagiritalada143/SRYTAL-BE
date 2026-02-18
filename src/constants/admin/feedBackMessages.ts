export const FEEDBACK_MESSAGES = {
    FEEDBACK_ADD_SUCCESS_MESSAGE: 'Feedback added successfully !!',
};

export const FEEDBACK_ERROR_MESSAGES = {
    FEEDBACK_ADD_ERROR_MESSAGE: 'Error occured while adding feedback. !!',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;
