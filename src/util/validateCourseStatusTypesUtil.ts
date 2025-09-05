import validStatusValues from '../types/validCourseStatusTypes';

const isValidStatus = (status: string): boolean => {
    return validStatusValues.includes(status.toUpperCase());
};

export default isValidStatus;
