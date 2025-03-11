import mongoose from "mongoose";
import {IPackage} from '../interfaces/package'

const PackagesSchema = new mongoose.Schema(
    {
         id: { type: mongoose.Schema.Types.Number },
         title: { type: mongoose.Schema.Types.String},
         description: { type: mongoose.Schema.Types.String},
         startDate: { type: mongoose.Schema.Types.Date},
         endDate: { type: mongoose.Schema.Types.Date},
    }
)
const PackagesModel = mongoose.model<IPackage>('packages', PackagesSchema);
export default PackagesModel;