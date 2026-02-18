export const FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES = {
    FEEDBACK_ADD_SUCCESS_MESSAGE: 'Feedback attribute added successfully !!',
};

export const FEEDBACK_ATTRIBUTE_ERROR_MESSAGES = {
    FEEDBACK_ADD_ERROR_MESSAGE: 'Error occured while adding feedback attribute. !!',
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
