import mongoose, { Document } from 'mongoose';

export interface ICourses extends Document {
    courseName: string;
    courseDescription: string;
    thumbnail?: string;
    status?: string;
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
    };
}

export interface IFetchCourseByIdResponse {
    success: boolean;
    coursedata?: any;
}
