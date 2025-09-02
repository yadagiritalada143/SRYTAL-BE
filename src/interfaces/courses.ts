import mongoose, { Document } from 'mongoose';

export interface ICourses extends Document {
    courseName: string;
    courseDescription:string;
    
}
