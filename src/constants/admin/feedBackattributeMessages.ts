export const FEEDBACK_ATTRIBUTE_SUCCESS_MESSAGES = {
    FEEDBACK_ATTRIBUTE_ADD_SUCCESS_MESSAGE: 'Feedback attribute added successfully !!',
    FEEDBACK_ATTRIBUTE_UPDATE_SUCCESS_MESSAGE: 'Feedback attribute updated successfully !!',
    FEEDBACK_ATTRIBUTE_FETCH_SUCCESS_MESSAGE: 'Feedback attribute details fetched successfully !!',
};

export const FEEDBACK_ATTRIBUTE_ERROR_MESSAGES = {
    FEEDBACK_ATTRIBUTE_ADD_ERROR_MESSAGE: 'Error occured while adding feedback attribute. !!',
    FEEDBACK_ATTRIBUTE_UPDATE_ERROR_MESSAGE: 'Error occured while updating feedback attribute. !!',
    FEEDBACK_ATTRIBUTE_FETCH_ERROR_MESSAGE: 'Error occured while fetching feedback attribute details. !!',
    FEEDBACK_ATTRIBUTE_NOT_FOUND_ERROR_MESSAGE: 'Feedback attribute not found. !!',
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
