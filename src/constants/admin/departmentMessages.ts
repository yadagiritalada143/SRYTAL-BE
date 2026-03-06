export const DEPARTMENT_SUCCESS_MESSAGES = {
    DEPARTMENT_ADD_SUCCESS_MESSAGE: 'Department added successfully !!',
    FETCH_ALL_DEPARTMENTS_SUCCESS_MESSAGE: 'Fetched all departments successfully !!',
    FETCH_DEPARTMENT_SUCCESS_MESSAGE: 'Fetched department details successfully !!'
}

export const DEPARTMENT_ERROR_MESSAGES = {
    DEPARTMENT_ADD_ERROR_MESSAGE: 'An error occurred while adding department !!',
    FETCH_ALL_DEPARTMENTS_ERROR_MESSAGE: 'An error occurred while fetching all departments !!',
    FETCH_DEPARTMENT_ERROR_MESSAGE: 'An error occurred while fetching department details !!',
    DEPARTMENT_NOT_FOUND_ERROR_MESSAGE: 'Department not found !!'
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
