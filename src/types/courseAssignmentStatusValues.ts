/**
 * The values persisted in `course-assignments.status`. These must stay in sync
 * with the enum on courseAssignmentModel — the DB rejects anything else.
 * (Note: `types/courseAssignment.ts` declares a different, upper-snake shape
 * that the model never used; the strings below are the stored ones.)
 */
export const COURSE_ASSIGNMENT_STATUS = {
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed'
};

export const validCourseAssignmentStatusValues: string[] = [
    COURSE_ASSIGNMENT_STATUS.ASSIGNED,
    COURSE_ASSIGNMENT_STATUS.IN_PROGRESS,
    COURSE_ASSIGNMENT_STATUS.COMPLETED
];

export default validCourseAssignmentStatusValues;
