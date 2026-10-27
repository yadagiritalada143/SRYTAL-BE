export interface ICloneCourseModuleSelection {
    moduleId: string;
    taskIds: string[];
}

export interface ICloneCourseInput {
    courseId: string;
    courseName: string;
    modules: ICloneCourseModuleSelection[];
}

export interface IClonedCourseTask {
    taskId: string;
    taskName: string;
    type?: string;
    status?: string;
}

export interface IClonedCourseModule {
    moduleId: string;
    moduleName: string;
    status?: string;
    tasks: IClonedCourseTask[];
}

export interface ICloneCourseData {
    courseId: string;
    courseName: string;
    status: string;
    modules: IClonedCourseModule[];
}

export interface ICloneCourseResponse {
    success: boolean;
    code?: string;
    message?: string;
    data?: ICloneCourseData;
}

export interface IResolvedModuleSelection {
    sourceModule: any;
    sourceTasks: any[];
}

export interface ICloneTracker {
    courseId?: any;
    moduleIds: any[];
    taskIds: any[];
}
