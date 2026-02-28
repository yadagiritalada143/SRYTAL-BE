import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import Bloodgroup from '../model/bloodGroupModel';
import Employmenttype from '../model/employmentTypeModel';
import Employeerole from '../model/employeeRole';
import Organization from '../model/organization';
import IUser from '../interfaces/user';

const UserSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.String },
    firstName: { type: mongoose.Schema.Types.String },
    lastName: { type: mongoose.Schema.Types.String },
    email: { type: mongoose.Schema.Types.String, required: true, unique: true },
    password: { type: mongoose.Schema.Types.String },
    mobileNumber: { type: mongoose.Schema.Types.Number },
    userRole: { type: mongoose.Schema.Types.String },
    passwordResetRequired: { type: mongoose.Schema.Types.String },
    bloodGroup: { type: mongoose.Schema.Types.ObjectId, ref: Bloodgroup },
    bankDetailsInfo: {
      accountHolderName: { type: mongoose.Schema.Types.String },
      bankName: { type: mongoose.Schema.Types.String },
      accountNumber: { type: mongoose.Schema.Types.String },
      ifscCode: { type: mongoose.Schema.Types.String },
    },
    profileImage: { type: mongoose.Schema.Types.String },
    employmentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Employmenttype,
    },
    employeeRole: [{ type: mongoose.Schema.Types.ObjectId, ref: Employeerole }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: Organization },
    applicationWalkThrough: { type: mongoose.Schema.Types.Number },
    isDeleted: { type: mongoose.Schema.Types.Boolean },
    created_on: { type: mongoose.Schema.Types.Date },
    lastLoggedOn: { type: mongoose.Schema.Types.Date },
    dateOfBirth: { type: mongoose.Schema.Types.Date },
    aadharNumber: { type: mongoose.Schema.Types.String },
    panCardNumber: { type: mongoose.Schema.Types.String },
    presentAddress: { type: mongoose.Schema.Types.String },
    permanentAddress: { type: mongoose.Schema.Types.String },
    refreshToken: { type: mongoose.Schema.Types.String },
  },
  {
    collection: 'users',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  });

UserSchema.plugin(uniqueValidator);

UserSchema.virtual('id').get(function () {
  return String(this._id);
});

const UserModel = mongoose.model<IUser>('UserSchema', UserSchema);

export default UserModel;
