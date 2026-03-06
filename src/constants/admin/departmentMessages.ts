export const DEPARTMENT_SUCCESS_MESSAGES = {
    DEPARTMENT_ADD_SUCCESS_MESSAGE: 'Department added successfully !!',
    FETCH_ALL_DEPARTMENTS_SUCCESS_MESSAGE: 'Fetched all departments successfully !!',
}

export const DEPARTMENT_ERROR_MESSAGES = {
    DEPARTMENT_ADD_ERROR_MESSAGE: 'An error occurred while adding department !!',
    FETCH_ALL_DEPARTMENTS_ERROR_MESSAGE: 'An error occurred while fetching all departments !!',
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
