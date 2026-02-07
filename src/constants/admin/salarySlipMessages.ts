export const SALARY_SLIP_SUCCESS_MESSAGES = {
    SALARY_SLIP_GENERATED_SUCCESS: 'Salary slip generated successfully !!',
};

export const SALARY_SLIP_ERROR_MESSAGES = {
    SALARY_SLIP_GENERATION_FAILED: 'Failed to generate salary slip !!',
    SALARY_SLIP_INVALID_DATA: 'Invalid salary slip data provided !!',
    SALARY_SLIP_MISSING_REQUIRED_FIELDS: 'Missing required fields for salary slip generation !!',
    SALARY_SLIP_UNEXPECTED_ERROR: 'An unexpected error occurred while generating salary slip !!',
    SALARY_SLIP_PDF_GENERATION_ERROR: 'Error occurred during PDF generation !!',
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
