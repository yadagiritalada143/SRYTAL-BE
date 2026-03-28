import mongoose, { Document } from 'mongoose';

export interface ICourses extends Document {
  courseName: string;
  courseDescription: string;
  thumbnail?: string;
}

export interface IFetchAllCoursesResponse {
  success: boolean;
  courses?: any;
}

export interface IFetchCourseByIdResponse {
  success: boolean;
  coursedata?: any;
}
