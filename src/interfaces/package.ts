import mongoose, {Document}from "mongoose";

export interface IPackage extends Document {
    id:number;
    Tittle:string;
    description:string;
    startDate:Date;
    endDate:Date;
}
