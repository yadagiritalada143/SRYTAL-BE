import mongoose, { Schema } from 'mongoose';

const OrganizationSchema: Schema = new mongoose.Schema(
  {
    organizationName: { type: mongoose.Schema.Types.String, required: true },
  },
  {
    collection: 'organization',
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const Organization = mongoose.model('OrganizationSchema', OrganizationSchema);
export default Organization;
