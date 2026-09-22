export const PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES = {
    PROGRAMMING_LANGUAGE_ADD_SUCCESS_MESSAGE: 'Programming language added successfully !!',
}

export const PROGRAMMING_LANGUAGES_ERROR_MESSAGES = {
    PROGRAMMING_LANGUAGE_ADD_ERROR_MESSAGE: 'An error occurred while adding programming language !!'
}

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
