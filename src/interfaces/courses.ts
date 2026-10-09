import mongoose, { Document } from 'mongoose';

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
        totalInactiveTasks: number;
    };
}

export interface IFetchCourseByIdResponse {
    success: boolean;
    coursedata?: any;
}
