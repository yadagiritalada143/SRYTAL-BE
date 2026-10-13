/** A single module (with its selected task ids) the writer chose to clone. */
export interface ICloneCourseModuleSelection {
    moduleId: string;
    taskIds: string[];
}

/** Normalized payload accepted by the clone-course service. */
export interface ICloneCourseInput {
    courseId: string;
    courseName: string;
    modules: ICloneCourseModuleSelection[];
}

/** Cloned task summary returned to the client. */
export interface IClonedCourseTask {
    taskId: string;
    taskName: string;
    type?: string;
    status?: string;
}

/** Cloned module summary returned to the client. */
export interface IClonedCourseModule {
    moduleId: string;
    moduleName: string;
    status?: string;
    tasks: IClonedCourseTask[];
}

/** Payload returned by the clone-course service on success. */
export interface ICloneCourseData {
    courseId: string;
    courseName: string;
    status: string;
    modules: IClonedCourseModule[];
}

/**
 * Discriminated failure/result returned by the clone-course service so the
 * controller can map each outcome to the correct HTTP status code.
 */
export interface ICloneCourseResponse {
    success: boolean;
    code?: string;
    message?: string;
    data?: ICloneCourseData;
}
