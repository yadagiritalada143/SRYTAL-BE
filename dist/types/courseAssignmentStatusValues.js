"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validCourseAssignmentStatusValues = exports.COURSE_ASSIGNMENT_STATUS = void 0;
/**
 * The values persisted in `course-assignments.status`. These must stay in sync
 * with the enum on courseAssignmentModel — the DB rejects anything else.
 * (Note: `types/courseAssignment.ts` declares a different, upper-snake shape
 * that the model never used; the strings below are the stored ones.)
 */
exports.COURSE_ASSIGNMENT_STATUS = {
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed'
};
exports.validCourseAssignmentStatusValues = [
    exports.COURSE_ASSIGNMENT_STATUS.ASSIGNED,
    exports.COURSE_ASSIGNMENT_STATUS.IN_PROGRESS,
    exports.COURSE_ASSIGNMENT_STATUS.COMPLETED
];
exports.default = exports.validCourseAssignmentStatusValues;
