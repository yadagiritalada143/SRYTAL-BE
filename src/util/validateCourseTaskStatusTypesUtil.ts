import validCourseTaskStatusValues from '../types/validCourseTaskStatusTypes';

const isValidCourseTaskStatus = (status: string): boolean => {
    return validCourseTaskStatusValues.includes(String(status || '').toUpperCase());
};

export default isValidCourseTaskStatus;
