/**
 * Response shapes for the employee-facing ("my courses") endpoints. These are
 * plain view models assembled in the services — they are deliberately not the
 * raw mongoose documents, so the employee never receives S3 object keys or
 * other authoring-only fields.
 */

export interface IMyCourseTask {
    _id: string;
    taskName: string;
    taskDescription: string;
    status?: string;
    // 'FILE' (streamed from S3 through the content proxy) or 'LINK'.
    type?: string;
    // Only populated for 'LINK' tasks — the external URL. 'FILE' content stays
    // server-side and is reached through /contentwriter/getCourseTaskContent.
    link?: string;
    contentMimeType?: string;
    contentFileName?: string;
    isCompleted: boolean;
    completedAt?: Date | null;
}

export interface IMyCourseModule {
    _id: string;
    moduleName: string;
    moduleDescription: string;
    status?: string;
    tasks: IMyCourseTask[];
    totalTasks: number;
    completedTasks: number;
}

export interface IMyCourseProgress {
    totalTasks: number;
    completedTasks: number;
    // Whole-number percentage (0-100).
    percentComplete: number;
}

export interface IMyAssignedCourseSummary {
    courseAssignmentId: string;
    courseId: string;
    courseName: string;
    courseDescription: string;
    thumbnailUrl: string;
    status: string;
    assignedAt: Date;
    dueDate: Date;
    completedAt?: Date | null;
    isOverdue: boolean;
    totalModules: number;
    progress: IMyCourseProgress;
}

export interface IMyAssignedCourseDetail extends IMyAssignedCourseSummary {
    modules: IMyCourseModule[];
}

export interface IFetchMyAssignedCoursesResponse {
    success: boolean;
    courses: IMyAssignedCourseSummary[];
}

export interface IFetchMyAssignedCourseByIdResponse {
    success: boolean;
    course?: IMyAssignedCourseDetail;
}

export interface IUpdateMyTaskProgressResponse {
    success: boolean;
    // Set when the assignment could not be found for this employee.
    notFound?: boolean;
    // Set when the task is not part of the assigned course.
    invalidTask?: boolean;
    courseStatus?: string;
    progress?: IMyCourseProgress;
    task?: { taskId: string; isCompleted: boolean; completedAt?: Date | null };
}
