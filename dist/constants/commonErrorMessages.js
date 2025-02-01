"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPLOYEE_ERRORS = exports.ORGANIZATION_THEMES_ERROR_MESSAGES = exports.APPLICATION_WALK_THROUGH_ERROR_MESSAGE = exports.EMAIL_ERROR_MESSAGE = exports.LOGIN_ERROR_MESSAGE = exports.COMMON_ERRORS = void 0;
exports.COMMON_ERRORS = {
    USER_FETCHING_ERROR: 'An error occurred while fetching details, Please try again !',
    USER_UPDATING_ERROR: 'An error occurred while updating details, Please try again !',
    VISITORS_COUNT_UPDATING_ERROR: 'An error occured while updating visitiors count, Please try again !',
};
exports.LOGIN_ERROR_MESSAGE = {
    INVALID_EMAIL_PASSWORD: 'Invalid Credentials !',
    INTERNAL_SERVER_ERROR: 'Internal server error !',
    INVALID_INPUT: 'Invalid input. Please provide a valid email/password !'
};
exports.EMAIL_ERROR_MESSAGE = {
    SEND_NOTIFICATION_ERROR: 'Error in sending mail !'
};
exports.APPLICATION_WALK_THROUGH_ERROR_MESSAGE = {
    UPDATE_APP_WALK_THROUGH_ERROR: 'Error occured while updating Application walk through Flag !'
};
exports.ORGANIZATION_THEMES_ERROR_MESSAGES = {
    THEMES_FETCHING_ERROR: 'Error occured while getting the themes !!'
};
// This handles all common errors for all employees/recruiters/admin 
exports.EMPLOYEE_ERRORS = {
    EMPLOYEE_DETAILS_FETCHING_ERROR: 'An error occurred while fetching Employee details, Please try again !',
    EMPLOYEE_PROFILE_IMAGE_UPDATE_ERROR: 'Error occured while updating the Profile Image, Please try again !',
    EMPLOYEE_PROFILE_IMAGE_GETTING_ERROR: 'Error occured while fetching the Profile Image, Please try again !'
};
