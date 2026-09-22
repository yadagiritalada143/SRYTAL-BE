export const PROGRAMMING_LANGUAGES_SUCCESS_MESSAGES = {
    PROGRAMMING_LANGUAGE_ADD_SUCCESS_MESSAGE: 'Programming language added successfully !!',
    PROGRAMMING_LANGUAGE_UPDATE_SUCCESS_MESSAGE: 'Programming language updated successfully !!',
    FETCH_ALL_PROGRAMMING_LANGUAGES_SUCCESS_MESSAGE: 'Fetched all programming languages successfully !!',
    FETCH_PROGRAMMING_LANGUAGE_BY_ID_SUCCESS_MESSAGE: 'Fetched programming language successfully !!',
}

export const PROGRAMMING_LANGUAGES_ERROR_MESSAGES = {
    PROGRAMMING_LANGUAGE_ADD_ERROR_MESSAGE: 'An error occurred while adding programming language !!',
    PROGRAMMING_LANGUAGE_UPDATE_ERROR_MESSAGE: 'An error occurred while updating programming language !!',
    FETCH_ALL_PROGRAMMING_LANGUAGES_ERROR_MESSAGE: 'An error occurred while fetching all programming languages !!',
    FETCH_PROGRAMMING_LANGUAGE_BY_ID_ERROR_MESSAGE: 'An error occurred while fetching programming language !!',
    FETCH_PROGRAMMING_LANGUAGE_BY_ID_NOT_FOUND_MESSAGE: 'Programming language not found !!'
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
