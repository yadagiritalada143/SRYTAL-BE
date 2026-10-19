import { Document } from 'mongoose';

export interface ICourses extends Document {
    courseName: string;
    courseDescription: string;
    thumbnail?: string;
    status?: string;
    totalArchivedCourses: string,
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFetchAllCoursesResponse {
    success: boolean;
    courses?: any;
    totals?: {
        totalCourses: number;
        totalModules: number;
        totalTasks: number;
        totalActiveCourses: number;
        totalArchivedCourses: number;
        totalActiveModules: number;
        totalArchivedModules: number;
        totalActiveTasks: number;
        totalArchivedTasks: number;
    };
}

export interface IFetchAllActiveCoursesResponse {
    success?: boolean;
    courses?: any;
    totalActiveCourses?: number;
}

export interface IFetchCourseByIdResponse {
    success: boolean;
    coursedata?: any;
    totals?: {
        totalModules: number;
        totalTasks: number;
        totalActiveModules: number;
        totalArchivedModules: number;
        totalActiveTasks: number;
        totalArchivedTasks: number;
    };
}

export interface updateCourseResponse {
    success: boolean;
    responseAfterUpdateCourse?: any;
}

export interface ICourseDueDateUpdateEmailDetails {
    employeeName: string;
    employeeEmail: string;
    courseName: string;
    oldDueDate: Date | string;
    newDueDate: Date | string;
    isExtended: boolean;
}

export interface ICourseReminderEmailDetails {
    employeeName: string;
    employeeEmail: string;
    courseName: string;
    dueDate: Date | string;
}
