"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP_STATUS = exports.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES = exports.EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES = void 0;
exports.EMPLOYEE_SALARY_SLIP_SUCCESS_MESSAGES = {
    EMPLOYEE_SALARY_SLIPS_FETCHED_SUCCESSFULLY: 'Employee salary slips fetched successfully',
    EMPLOYEE_SALARY_SLIP_DOWNLOADED: 'Salary slip download URL fetched successfully',
};
exports.EMPLOYEE_SALARY_SLIP_ERROR_MESSAGES = {
    EMPLOYEE_SALARY_SLIPS_FETCHING_ERROR: 'Error occurred while fetching employee salary slips',
    EMPLOYEE_ID_REQUIRED: 'Employee ID is required',
    EMPLOYEE_SALARY_SLIP_DOWNLOADED_ERROR: 'Error occurred while fetching salary slip download URL',
    UNAUTHORIZED_ACCESS: 'You are not authorized to access this employee\'s salary slips',
    SALARY_SLIP_NOT_FOUND: 'Salary slip not found for the specified month and year',
    INVALID_REQUEST_PARAMS: 'Invalid request parameters. mongoId, fullName, month, and year are required',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};
