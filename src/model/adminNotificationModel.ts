import mongoose, { Schema } from 'mongoose';
import {IAdminNotification} from '../interfaces/adminnotification';

const AdminnotificationSchema: Schema = new mongoose.Schema({
    context: { type: mongoose.Schema.Types.String },
    status: { type: mongoose.Schema.Types.String }
}, {
    collection: 'admin-notifications',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

const AdminnotificationModel = mongoose.model<IAdminNotification>('AdminnotificationSchema', AdminnotificationSchema);
export default AdminnotificationModel;
