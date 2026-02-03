export const PACKAGE_ERROR_MESSAGES = {
    PACKAGE_FETCH_ERROR_MESSAGE: 'Error occured while getting the Packages !!',
    PACKAGE_DETAILS_FETCH_ERROR_MESSAGE: 'Error occured while getting the Package Details !!',
    PACKAGE_ADD_ERROR_MESSAGE: 'Error occured while adding the Packages !!',
    PACKAGE_UNEXPECTED_ERROR_MESSAGE: 'Something went wrong while adding the Package !!',
    PACKAGE_UPDATING_ERROR_MESSAGE: 'Error occured while updating the Packages !!',
    PACKAGE_SOFT_DELETE_ERROR_MESSAGE: 'Error occured while (soft) deleting the package !!',
    PACKAGE_HARD_DELETE_ERROR_MESSAGE: 'Error occured while (hard) deleting the package !!'
};

export const PACKAGE_SUCCESS_MESSAGES = {
    PACKAGE_ADD_SUCCESS_MESSAGE: 'Packages added Successfully !',
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
